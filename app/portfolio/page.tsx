"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "lucide-react"
import Link from "next/link"
import { portfolioHoldings, transactions } from "@/lib/mock-data"

// Extended data for portfolio page
const dividendHistory = [
  { id: 1, property: "Premium Commercial Complex", amount: 8500, date: "2024-03-15", quarter: "Q1 2024" },
  { id: 2, property: "Tech Park Office Space", amount: 6200, date: "2024-03-15", quarter: "Q1 2024" },
  { id: 3, property: "Premium Retail Complex", amount: 12500, date: "2024-03-15", quarter: "Q1 2024" },
  { id: 4, property: "Premium Commercial Complex", amount: 8200, date: "2023-12-15", quarter: "Q4 2023" },
  { id: 5, property: "Tech Park Office Space", amount: 5900, date: "2023-12-15", quarter: "Q4 2023" },
]

const allocationData = [
  { type: "Commercial", percentage: 45, value: 2500000, color: "bg-accent" },
  { type: "Office", percentage: 30, value: 2000000, color: "bg-[oklch(0.65_0.15_165)]" },
  { type: "Retail", percentage: 25, value: 3000000, color: "bg-[oklch(0.75_0.15_80)]" },
]

export default function PortfolioPage() {
  const [dateFilter, setDateFilter] = useState("all")

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
  const totalDividends = dividendHistory.reduce((acc, d) => acc + d.amount, 0)

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
                      {portfolioHoldings.map((holding, index) => (
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
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/properties/${holding.propertyId}`}>
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </Button>
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
                        {dividendHistory.map((div) => (
                          <div key={div.id} className="flex items-center justify-between py-3 border-b last:border-0">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-[oklch(0.65_0.15_165)]/10">
                                <ArrowDownRight className="h-4 w-4 text-[oklch(0.65_0.15_165)]" />
                              </div>
                              <div>
                                <p className="font-medium">{div.property}</p>
                                <p className="text-xs text-muted-foreground">{div.quarter}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-[oklch(0.65_0.15_165)]">+{formatCurrency(div.amount)}</p>
                              <p className="text-xs text-muted-foreground">{div.date}</p>
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
                  {/* Simple pie chart representation */}
                  <div className="relative h-40 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="oklch(0.55 0.15 250)"
                        strokeWidth="20"
                        strokeDasharray="113 251"
                        className="opacity-0 animate-fade-in"
                        style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="oklch(0.65 0.15 165)"
                        strokeWidth="20"
                        strokeDasharray="75 251"
                        strokeDashoffset="-113"
                        className="opacity-0 animate-fade-in"
                        style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="oklch(0.75 0.15 80)"
                        strokeWidth="20"
                        strokeDasharray="63 251"
                        strokeDashoffset="-188"
                        className="opacity-0 animate-fade-in"
                        style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-semibold">3</p>
                        <p className="text-xs text-muted-foreground">Assets</p>
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
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
    </div>
  )
}
