"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Building2,
  Banknote,
  Download,
  Calendar,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { api, getExplorerUrl } from "@/lib/api-client"
import type { Holding, Transaction } from "@/lib/api-client"

// Pie chart colors per property type
const TYPE_COLORS: Record<string, { stroke: string; bg: string }> = {
  Commercial: { stroke: "oklch(0.55 0.15 250)", bg: "bg-accent" },
  Office:     { stroke: "oklch(0.65 0.15 165)", bg: "bg-[oklch(0.65_0.15_165)]" },
  Retail:     { stroke: "oklch(0.75 0.15 80)",  bg: "bg-[oklch(0.75_0.15_80)]" },
  Residential:{ stroke: "oklch(0.60 0.15 30)",  bg: "bg-[oklch(0.60_0.15_30)]" },
  "Mixed-Use":{ stroke: "oklch(0.70 0.10 300)", bg: "bg-[oklch(0.70_0.10_300)]" },
}

export default function PortfolioPage() {
  const [dateFilter, setDateFilter] = useState("all")
  const [portfolioHoldings, setPortfolioHoldings] = useState<Holding[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [sellDialog, setSellDialog] = useState<{ open: boolean; holding: Holding | null }>({
    open: false, holding: null
  })
  const [sellQuantity, setSellQuantity] = useState(1)
  const [selling, setSelling] = useState(false)
  const [sellSuccess, setSellSuccess] = useState(false)
  const [sellError, setSellError] = useState("")

  const loadData = () => {
    api.portfolio.holdings().then(setPortfolioHoldings).catch(() => {})
    api.portfolio.transactions().then(setTransactions).catch(() => {})
  }

  useEffect(() => {
    loadData()
    // Refresh when user navigates back to this tab
    const onFocus = () => loadData()
    window.addEventListener("focus", onFocus)
    document.addEventListener("visibilitychange", () => { if (!document.hidden) loadData() })
    return () => window.removeEventListener("focus", onFocus)
  }, [])

  const openSellDialog = (holding: Holding) => {
    setSellDialog({ open: true, holding })
    setSellQuantity(1)
    setSellSuccess(false)
    setSellError("")
  }

  const handleSell = async () => {
    if (!sellDialog.holding) return
    setSelling(true)
    setSellError("")
    try {
      await api.tokens.sell(sellDialog.holding.propertyId, sellQuantity)
      setSellSuccess(true)
      loadData() // refresh holdings
    } catch (err: any) {
      setSellError(err.message || "Sell failed")
    } finally {
      setSelling(false)
    }
  }

  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`
    }
    return `₹${value.toLocaleString('en-IN')}`
  }

  // Calculate totals
  const totalPortfolioValue = portfolioHoldings.reduce(
    (acc, h) => acc + h.tokensOwned * h.currentPrice,
    0
  )
  const totalInvested = portfolioHoldings.reduce(
    (acc, h) => acc + h.tokensOwned * h.purchasePrice,
    0
  )
  const totalUnrealizedPL = portfolioHoldings.reduce((acc, h) => acc + h.unrealizedPL, 0)
  const totalRentalIncome = portfolioHoldings.reduce((acc, h) => acc + h.rentalIncome, 0)
  const totalDividends = transactions
    .filter(t => t.type === "dividend")
    .reduce((acc, t) => acc + t.amount, 0)

  // Compute allocation from real holdings grouped by property type
  // We derive type from propertyTitle keywords as a fallback since Holding doesn't carry type
  const allocationData = (() => {
    const typeMap: Record<string, number> = {}
    portfolioHoldings.forEach(h => {
      const type = h.propertyType || "Commercial"
      typeMap[type] = (typeMap[type] ?? 0) + h.tokensOwned * h.currentPrice
    })
    const total = Object.values(typeMap).reduce((a, b) => a + b, 0) || 1
    return Object.entries(typeMap).map(([type, value]) => ({
      type,
      value,
      percentage: Math.round((value / total) * 100),
      color: TYPE_COLORS[type]?.bg ?? "bg-muted",
      stroke: TYPE_COLORS[type]?.stroke ?? "oklch(0.5 0.1 0)",
    }))
  })()

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar variant="investor" />
      
      <main className="pl-64 transition-all duration-300">
        <DashboardHeader 
          title="Portfolio"
          subtitle="Manage your real estate investments"
        />

        <div className="p-6 space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Portfolio Value"
              value={formatCurrency(totalPortfolioValue)}
              change={4.2}
              icon={Wallet}
              index={0}
            />
            <StatCard
              title="Total Invested"
              value={formatCurrency(totalInvested)}
              icon={Building2}
              index={1}
            />
            <StatCard
              title="Unrealized P/L"
              value={formatCurrency(totalUnrealizedPL)}
              change={((totalUnrealizedPL / totalInvested) * 100)}
              icon={TrendingUp}
              variant="success"
              index={2}
            />
            <StatCard
              title="Rental Income (YTD)"
              value={formatCurrency(totalRentalIncome)}
              icon={Banknote}
              variant="success"
              index={3}
            />
            <StatCard
              title="Total Dividends"
              value={formatCurrency(totalDividends)}
              icon={Banknote}
              index={4}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Holdings Table - 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="opacity-0 animate-fade-in-up animation-delay-100">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base">Your Holdings</CardTitle>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead className="text-right">Tokens</TableHead>
                        <TableHead className="text-right">Avg. Cost</TableHead>
                        <TableHead className="text-right">Current Value</TableHead>
                        <TableHead className="text-right">P/L</TableHead>
                        <TableHead className="text-right">Rental Income</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {portfolioHoldings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                            No holdings yet. <Link href="/marketplace" className="underline">Browse marketplace</Link>
                          </TableCell>
                        </TableRow>
                      ) : portfolioHoldings.map((holding, index) => (
                        <TableRow 
                          key={holding.id}
                          className="opacity-0 animate-fade-in-up"
                          style={{ animationDelay: `${(index + 2) * 100}ms`, animationFillMode: 'forwards' }}
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium">{holding.propertyTitle}</p>
                              <p className="text-xs text-muted-foreground">{holding.location}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {holding.tokensOwned}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(holding.purchasePrice)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(holding.tokensOwned * holding.currentPrice)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className={`flex items-center justify-end gap-1 ${
                              holding.unrealizedPL >= 0 ? "text-[oklch(0.65_0.15_165)]" : "text-destructive"
                            }`}>
                              {holding.unrealizedPL >= 0 ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              <span>{holding.unrealizedPL >= 0 ? "+" : ""}{formatCurrency(holding.unrealizedPL)}</span>
                              <span className="text-xs">({holding.unrealizedPLPercent}%)</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-[oklch(0.65_0.15_165)]">
                            {formatCurrency(holding.rentalIncome)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/properties/${holding.propertyId}`}>
                                  <ExternalLink className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => openSellDialog(holding)}
                              >
                                Sell
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Income History Tabs */}
              <Tabs defaultValue="rental" className="opacity-0 animate-fade-in-up animation-delay-200">
                <div className="flex items-center justify-between mb-4">
                  <TabsList>
                    <TabsTrigger value="rental">Rental Income</TabsTrigger>
                    <TabsTrigger value="dividends">Dividends</TabsTrigger>
                    <TabsTrigger value="transactions">All Transactions</TabsTrigger>
                  </TabsList>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-32">
                      <Calendar className="mr-2 h-4 w-4" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="ytd">YTD</SelectItem>
                      <SelectItem value="6m">Last 6 Months</SelectItem>
                      <SelectItem value="1y">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Card>
                  <CardContent className="pt-6">
                    <TabsContent value="rental" className="m-0">
                      <div className="space-y-4">
                        {transactions
                          .filter(t => t.type === "rental")
                          .map((txn) => (
                            <div key={txn.id} className="flex items-center justify-between py-3 border-b last:border-0">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-[oklch(0.65_0.15_165)]/10">
                                  <ArrowDownRight className="h-4 w-4 text-[oklch(0.65_0.15_165)]" />
                                </div>
                                <div>
                                  <p className="font-medium">{txn.propertyTitle}</p>
                                  <p className="text-xs text-muted-foreground">Monthly rental income</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-[oklch(0.65_0.15_165)]">+{formatCurrency(txn.amount)}</p>
                                <p className="text-xs text-muted-foreground">{txn.date}</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="dividends" className="m-0">
                      <div className="space-y-4">
                        {transactions.filter(t => t.type === "dividend").length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-6">No dividends yet</p>
                        ) : transactions.filter(t => t.type === "dividend").map((txn) => (
                          <div key={txn.id} className="flex items-center justify-between py-3 border-b last:border-0">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-[oklch(0.65_0.15_165)]/10">
                                <ArrowDownRight className="h-4 w-4 text-[oklch(0.65_0.15_165)]" />
                              </div>
                              <div>
                                <p className="font-medium">{txn.propertyTitle}</p>
                                <p className="text-xs text-muted-foreground">Dividend</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-[oklch(0.65_0.15_165)]">+{formatCurrency(txn.amount)}</p>
                              <p className="text-xs text-muted-foreground">{txn.date}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="transactions" className="m-0">
                      <div className="space-y-4">
                        {transactions.map((txn) => (
                          <div key={txn.id} className="flex items-center justify-between py-3 border-b last:border-0">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                txn.type === "buy"
                                  ? "bg-accent/10"
                                  : txn.type === "sell"
                                    ? "bg-destructive/10"
                                    : "bg-[oklch(0.65_0.15_165)]/10"
                              }`}>
                                {txn.type === "buy" && <ArrowUpRight className="h-4 w-4 text-accent" />}
                                {txn.type === "sell" && <ArrowDownRight className="h-4 w-4 text-destructive" />}
                                {(txn.type === "rental" || txn.type === "dividend") && (
                                  <ArrowDownRight className="h-4 w-4 text-[oklch(0.65_0.15_165)]" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{txn.propertyTitle}</p>
                                <p className="text-xs text-muted-foreground capitalize">{txn.type}</p>
                                {txn.blockchainTx && (
                                  <a
                                    href={getExplorerUrl(txn.blockchainTx)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-[oklch(0.65_0.15_165)] flex items-center gap-1 mt-0.5 hover:underline"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    {txn.blockchainTx.startsWith("LOCAL_") || txn.blockchainTx.startsWith("MOCK_")
                                      ? "Mock tx"
                                      : `${txn.blockchainTx.slice(0, 12)}...`
                                    }
                                  </a>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-medium ${
                                txn.type === "buy" ? "text-foreground" : "text-[oklch(0.65_0.15_165)]"
                              }`}>
                                {txn.type === "buy" ? "-" : "+"}{formatCurrency(txn.amount)}
                              </p>
                              <p className="text-xs text-muted-foreground">{txn.date}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </CardContent>
                </Card>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Asset Allocation */}
              <Card className="opacity-0 animate-slide-in-right">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <PieChart className="h-4 w-4" />
                    Asset Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative h-40 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-32 h-32 transform -rotate-90">
                      {(() => {
                        const circumference = 2 * Math.PI * 40
                        let offset = 0
                        return allocationData.map((item, i) => {
                          const dash = (item.percentage / 100) * circumference
                          const el = (
                            <circle
                              key={item.type}
                              cx="50" cy="50" r="40"
                              fill="none"
                              stroke={item.stroke}
                              strokeWidth="20"
                              strokeDasharray={`${dash} ${circumference}`}
                              strokeDashoffset={-offset}
                              className="opacity-0 animate-fade-in"
                              style={{ animationDelay: `${(i + 2) * 100}ms`, animationFillMode: 'forwards' }}
                            />
                          )
                          offset += dash
                          return el
                        })
                      })()}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-semibold">{portfolioHoldings.length}</p>
                        <p className="text-xs text-muted-foreground">Assets</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {allocationData.map((item, index) => (
                      <div
                        key={item.type}
                        className="opacity-0 animate-fade-in-up"
                        style={{ animationDelay: `${(index + 3) * 100}ms`, animationFillMode: 'forwards' }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${item.color}`} />
                            <span className="text-sm">{item.type}</span>
                          </div>
                          <span className="text-sm font-medium">{item.percentage}%</span>
                        </div>
                        <Progress value={item.percentage} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Summary */}
              <Card className="opacity-0 animate-slide-in-right animation-delay-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Performance Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Return</span>
                      <span className="font-medium text-[oklch(0.65_0.15_165)]">
                        +{formatCurrency(totalUnrealizedPL + totalRentalIncome)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Capital Gains</span>
                      <span className="font-medium text-[oklch(0.65_0.15_165)]">
                        +{formatCurrency(totalUnrealizedPL)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Income Earned</span>
                      <span className="font-medium text-[oklch(0.65_0.15_165)]">
                        +{formatCurrency(totalRentalIncome)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border">
                    <p className="text-xs text-muted-foreground mb-1">Annualized Return</p>
                    <p className="text-2xl font-semibold text-[oklch(0.65_0.15_165)]">
                      {(((totalUnrealizedPL + totalRentalIncome) / totalInvested) * 100).toFixed(1)}%
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Download Statements */}
              <Card className="opacity-0 animate-slide-in-right animation-delay-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Statements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Portfolio Statement
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Tax Report (FY 2023-24)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Transaction History
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Sell Dialog */}
      <Dialog open={sellDialog.open} onOpenChange={(v) => {
        setSellDialog({ open: v, holding: sellDialog.holding })
        if (!v) { setSellSuccess(false); setSellError("") }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{sellSuccess ? "Tokens Sold! ✅" : "Sell Tokens"}</DialogTitle>
            <DialogDescription>
              {sellSuccess
                ? `Successfully sold ${sellQuantity} tokens`
                : `Sell tokens of ${sellDialog.holding?.propertyTitle}`
              }
            </DialogDescription>
          </DialogHeader>

          {!sellSuccess ? (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tokens Owned</span>
                  <span className="font-medium">{sellDialog.holding?.tokensOwned}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Price</span>
                  <span className="font-medium">{formatCurrency(sellDialog.holding?.currentPrice ?? 0)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Quantity to Sell</Label>
                <Input
                  type="number"
                  min={1}
                  max={sellDialog.holding?.tokensOwned}
                  value={sellQuantity}
                  onChange={e => setSellQuantity(Math.min(
                    Math.max(1, parseInt(e.target.value) || 1),
                    sellDialog.holding?.tokensOwned ?? 1
                  ))}
                />
                <div className="flex gap-2">
                  {[1, 5, 10, 25, 50].filter(q => q <= (sellDialog.holding?.tokensOwned ?? 0)).map(q => (
                    <Button key={q} variant="outline" size="sm" className="flex-1" onClick={() => setSellQuantity(q)}>
                      {q}
                    </Button>
                  ))}
                  <Button variant="outline" size="sm" className="flex-1"
                    onClick={() => setSellQuantity(sellDialog.holding?.tokensOwned ?? 1)}>
                    All
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tokens to Sell</span>
                  <span className="font-medium">{sellQuantity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">You Receive</span>
                  <span className="font-semibold text-[oklch(0.65_0.15_165)]">
                    {formatCurrency((sellDialog.holding?.currentPrice ?? 0) * sellQuantity)}
                  </span>
                </div>
              </div>

              {sellError && <p className="text-sm text-destructive text-center">{sellError}</p>}

              <Button
                className="w-full bg-destructive hover:bg-destructive/90"
                onClick={handleSell}
                disabled={selling}
              >
                {selling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {selling ? "Processing..." : `Sell ${sellQuantity} Tokens`}
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-lg bg-[oklch(0.65_0.15_165)]/10 text-center">
                <p className="text-2xl font-semibold text-[oklch(0.65_0.15_165)]">
                  +{formatCurrency((sellDialog.holding?.currentPrice ?? 0) * sellQuantity)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Added to your balance</p>
              </div>
              <Button className="w-full" onClick={() => setSellDialog({ open: false, holding: null })}>
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
