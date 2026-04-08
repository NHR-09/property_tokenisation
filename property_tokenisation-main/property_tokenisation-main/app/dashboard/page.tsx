"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Wallet,
  TrendingUp,
  Building2,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Bell,
  Eye,
} from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api-client"
import type { Holding, Transaction, Property } from "@/lib/api-client"
import { usePhantomWallet } from "@/lib/wallet-context"
import { useAuth } from "@/lib/auth-context"

export default function DashboardPage() {
  const [portfolioHoldings, setPortfolioHoldings] = useState<Holding[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const { connected, walletAddress, solBalance, connectWallet, disconnectWallet, connecting, linkWalletToAccount } = usePhantomWallet()
  const { user, updateWalletAddress } = useAuth()

  useEffect(() => {
    api.portfolio.holdings().then(setPortfolioHoldings).catch(() => {})
    api.portfolio.transactions().then(setTransactions).catch(() => {})
    api.properties.list().then(setProperties).catch(() => {})
  }, [])

  // Auto-link wallet to account when connected & save to Firebase
  useEffect(() => {
    if (connected && walletAddress && user?.user_id) {
      linkWalletToAccount(user.user_id)
        .then(() => updateWalletAddress(walletAddress))
        .catch(() => {})
    }
  }, [connected, walletAddress])

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
  
  const watchlist = properties.slice(0, 3)

  const notifications = [
    { id: 1, title: "Rental income credited", message: "₹3,100 from Tech Park Office Space", time: "2 hours ago", read: false },
    { id: 2, title: "New governance proposal", message: "Vote on renovation for Premium Commercial Complex", time: "5 hours ago", read: false },
    { id: 3, title: "Token price increased", message: "Premium Retail Complex token price up 2%", time: "1 day ago", read: true },
  ]

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar variant="investor" />
      
      <main className="pl-64 transition-all duration-300">
        <DashboardHeader 
          title="Dashboard"
          subtitle={`Welcome back, ${user?.name || "Investor"}`}
        />

        <div className="p-6 space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Portfolio Value"
              value={formatCurrency(totalPortfolioValue)}
              change={4.2}
              changeLabel="this month"
              icon={Wallet}
              variant="default"
              index={0}
            />
            <StatCard
              title="Invested Amount"
              value={formatCurrency(totalInvested)}
              icon={Building2}
              variant="default"
              index={1}
            />
            <StatCard
              title="Unrealized P/L"
              value={formatCurrency(totalUnrealizedPL)}
              change={totalInvested > 0 ? ((totalUnrealizedPL / totalInvested) * 100) : 0}
              icon={TrendingUp}
              variant="success"
              index={2}
            />
            <StatCard
              title="Rental Income (YTD)"
              value={formatCurrency(totalRentalIncome)}
              change={12.5}
              changeLabel="vs last year"
              icon={Banknote}
              variant="success"
              index={3}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Portfolio Performance Chart */}
              <Card className="opacity-0 animate-fade-in-up animation-delay-100">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base">Portfolio Performance</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-xs">1M</Button>
                    <Button variant="secondary" size="sm" className="text-xs">3M</Button>
                    <Button variant="ghost" size="sm" className="text-xs">6M</Button>
                    <Button variant="ghost" size="sm" className="text-xs">1Y</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center">
                    {/* Simplified chart representation */}
                    <svg className="w-full h-full" viewBox="0 0 400 200">
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="oklch(0.55 0.15 250)" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="oklch(0.55 0.15 250)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 0 180 Q 50 160, 80 140 T 160 120 T 240 100 T 320 70 T 400 50 L 400 200 L 0 200 Z"
                        fill="url(#chartGradient)"
                        className="animate-fade-in"
                      />
                      <path
                        d="M 0 180 Q 50 160, 80 140 T 160 120 T 240 100 T 320 70 T 400 50"
                        fill="none"
                        stroke="oklch(0.55 0.15 250)"
                        strokeWidth="2"
                        className="animate-fade-in"
                      />
                      {/* Data points */}
                      {[
                        { x: 0, y: 180 },
                        { x: 80, y: 140 },
                        { x: 160, y: 120 },
                        { x: 240, y: 100 },
                        { x: 320, y: 70 },
                        { x: 400, y: 50 },
                      ].map((point, i) => (
                        <circle
                          key={i}
                          cx={point.x}
                          cy={point.y}
                          r="4"
                          fill="oklch(0.55 0.15 250)"
                          className="opacity-0 animate-scale-in"
                          style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'forwards' }}
                        />
                      ))}
                    </svg>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Return</p>
                      <p className="text-xl font-semibold text-[oklch(0.65_0.15_165)]">+{formatCurrency(totalUnrealizedPL)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Return %</p>
                      <p className="text-xl font-semibold text-[oklch(0.65_0.15_165)]">+{totalInvested > 0 ? ((totalUnrealizedPL / totalInvested) * 100).toFixed(2) : "0.00"}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Owned Assets */}
              <Card className="opacity-0 animate-fade-in-up animation-delay-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base">Your Holdings</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/portfolio">
                      View All <ExternalLink className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead className="text-right">Tokens</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                        <TableHead className="text-right">P/L</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {portfolioHoldings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            No holdings yet. <Link href="/marketplace" className="underline">Browse marketplace</Link>
                          </TableCell>
                        </TableRow>
                      ) : portfolioHoldings.map((holding) => (
                        <TableRow key={holding.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{holding.propertyTitle}</p>
                              <p className="text-xs text-muted-foreground">{holding.location}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{holding.tokensOwned}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(holding.tokensOwned * holding.currentPrice)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={holding.unrealizedPL >= 0 ? "text-[oklch(0.65_0.15_165)]" : "text-destructive"}>
                              {holding.unrealizedPL >= 0 ? "+" : ""}{formatCurrency(holding.unrealizedPL)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Recent Transactions */}
              <Card className="opacity-0 animate-fade-in-up animation-delay-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base">Recent Transactions</CardTitle>
                  <Button variant="ghost" size="sm">
                    View All <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transactions.slice(0, 5).map((txn) => (
                      <div key={txn.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            txn.type === "buy" || txn.type === "rental" || txn.type === "dividend"
                              ? "bg-[oklch(0.65_0.15_165)]/10"
                              : "bg-destructive/10"
                          }`}>
                            {txn.type === "buy" || txn.type === "rental" || txn.type === "dividend" ? (
                              <ArrowDownRight className="h-4 w-4 text-[oklch(0.65_0.15_165)]" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4 text-destructive" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{txn.propertyTitle}</p>
                            <p className="text-xs text-muted-foreground">
                              {txn.type === "buy" && `Bought ${txn.tokens} tokens`}
                              {txn.type === "sell" && `Sold ${txn.tokens} tokens`}
                              {txn.type === "rental" && "Rental income"}
                              {txn.type === "dividend" && "Dividend payout"}
                            </p>
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
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - 1 column */}
            <div className="space-y-6">
              {/* Notifications */}
              <Card className="opacity-0 animate-slide-in-right">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notifications
                  </CardTitle>
                  <Badge variant="secondary">
                    {notifications.filter(n => !n.read).length}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50 ${
                        !notif.read ? "bg-muted/30" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm">{notif.title}</p>
                          <p className="text-xs text-muted-foreground">{notif.message}</p>
                        </div>
                        {!notif.read && (
                          <div className="h-2 w-2 rounded-full bg-accent mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{notif.time}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Watchlist */}
              <Card className="opacity-0 animate-slide-in-right animation-delay-100">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Watchlist
                  </CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/marketplace">Browse</Link>
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {watchlist.map((property) => (
                    <Link
                      key={property.id}
                      href={`/properties/${property.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div
                        className="w-12 h-12 rounded-lg bg-cover bg-center"
                        style={{ backgroundImage: `url(${property.image})` }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{property.title}</p>
                        <p className="text-xs text-muted-foreground">{property.city}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm text-[oklch(0.65_0.15_165)]">
                          {property.annualYield}%
                        </p>
                        <p className="text-xs text-muted-foreground">yield</p>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>

              {/* Wallet Status */}
              <Card className="opacity-0 animate-slide-in-right animation-delay-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Phantom Wallet
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {connected ? (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-sm font-medium text-green-600">Connected</span>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Address</p>
                        <p className="font-mono text-xs break-all">{walletAddress}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">SOL Balance</p>
                        <p className="font-semibold text-lg">
                          {solBalance !== null ? `${solBalance.toFixed(4)} SOL` : "Loading..."}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="w-full" onClick={disconnectWallet}>
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Not Connected</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Connect your Phantom wallet to enable crypto purchases and on-chain ownership.
                      </p>
                      <Button className="w-full" onClick={connectWallet} disabled={connecting}>
                        <Wallet className="mr-2 h-4 w-4" />
                        {connecting ? "Connecting..." : "Connect Phantom"}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
