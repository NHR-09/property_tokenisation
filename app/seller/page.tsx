"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Building2,
  Banknote,
  TrendingUp,
  Upload,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
} from "lucide-react"
import Link from "next/link"
import { sellerProperties } from "@/lib/mock-data"

export default function SellerDashboardPage() {
  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`
    }
    return `₹${value.toLocaleString('en-IN')}`
  }

  // Calculate totals
  const totalValuation = sellerProperties.reduce((acc, p) => acc + p.valuation, 0)
  const totalFundsRaised = sellerProperties.reduce((acc, p) => acc + p.fundsRaised, 0)
  const totalRentalIncome = sellerProperties.reduce((acc, p) => acc + p.rentalIncome, 0)
  const totalSoldTokens = sellerProperties.reduce((acc, p) => acc + p.soldTokens, 0)
  const totalTokens = sellerProperties.reduce((acc, p) => acc + p.totalTokens, 0)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "listed":
        return <Badge className="bg-[oklch(0.65_0.15_165)] hover:bg-[oklch(0.65_0.15_165)]">Listed</Badge>
      case "tokenized":
        return <Badge variant="secondary">Tokenized</Badge>
      case "verified":
        return <Badge className="bg-accent">Verified</Badge>
      case "pending":
        return <Badge variant="outline">Pending Review</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "listed":
        return <CheckCircle2 className="h-4 w-4 text-[oklch(0.65_0.15_165)]" />
      case "tokenized":
      case "verified":
        return <CheckCircle2 className="h-4 w-4 text-accent" />
      case "pending":
        return <Clock className="h-4 w-4 text-[oklch(0.75_0.15_80)]" />
      case "rejected":
        return <AlertCircle className="h-4 w-4 text-destructive" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar variant="seller" />
      
      <main className="pl-64 transition-all duration-300">
        <DashboardHeader 
          title="Seller Dashboard"
          subtitle="Manage your property listings"
        />

        <div className="p-6 space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Valuation"
              value={formatCurrency(totalValuation)}
              icon={Building2}
              index={0}
            />
            <StatCard
              title="Funds Raised"
              value={formatCurrency(totalFundsRaised)}
              change={12.5}
              icon={Banknote}
              variant="success"
              index={1}
            />
            <StatCard
              title="Monthly Rental Income"
              value={formatCurrency(totalRentalIncome)}
              icon={TrendingUp}
              variant="success"
              index={2}
            />
            <StatCard
              title="Properties Listed"
              value={sellerProperties.filter(p => p.status === "listed").length.toString()}
              icon={Upload}
              index={3}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Properties Table */}
            <Card className="lg:col-span-2 opacity-0 animate-fade-in-up animation-delay-100">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">Your Properties</CardTitle>
                <Button asChild>
                  <Link href="/seller/onboard">
                    <Plus className="mr-2 h-4 w-4" />
                    Onboard Property
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Valuation</TableHead>
                      <TableHead className="text-right">Tokens Sold</TableHead>
                      <TableHead className="text-right">Funds Raised</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sellerProperties.map((property, index) => {
                      const soldPercentage = property.totalTokens > 0
                        ? (property.soldTokens / property.totalTokens) * 100
                        : 0
                      
                      return (
                        <TableRow 
                          key={property.id}
                          className="opacity-0 animate-fade-in-up"
                          style={{ animationDelay: `${(index + 2) * 100}ms`, animationFillMode: 'forwards' }}
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium">{property.title}</p>
                              <p className="text-xs text-muted-foreground">{property.location}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(property.status)}
                              {getStatusBadge(property.status)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {property.valuation > 0 ? formatCurrency(property.valuation) : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            {property.totalTokens > 0 ? (
                              <div className="space-y-1">
                                <span className="font-medium">
                                  {property.soldTokens.toLocaleString()} / {property.totalTokens.toLocaleString()}
                                </span>
                                <Progress value={soldPercentage} className="h-1.5 w-20 ml-auto" />
                              </div>
                            ) : "-"}
                          </TableCell>
                          <TableCell className="text-right font-medium text-[oklch(0.65_0.15_165)]">
                            {property.fundsRaised > 0 ? formatCurrency(property.fundsRaised) : "-"}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Token Sales Overview */}
              <Card className="opacity-0 animate-slide-in-right">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Token Sales Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4">
                    <p className="text-4xl font-semibold">{totalTokens > 0 ? ((totalSoldTokens / totalTokens) * 100).toFixed(1) : 0}%</p>
                    <p className="text-sm text-muted-foreground">Tokens Sold</p>
                  </div>
                  <Progress value={totalTokens > 0 ? (totalSoldTokens / totalTokens) * 100 : 0} className="h-3" />
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-lg font-semibold">{totalSoldTokens.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Sold</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{(totalTokens - totalSoldTokens).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Available</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Onboarding Status */}
              <Card className="opacity-0 animate-slide-in-right animation-delay-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Pipeline Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "Pending Review", count: sellerProperties.filter(p => p.status === "pending").length, color: "bg-[oklch(0.75_0.15_80)]" },
                    { label: "Verified", count: sellerProperties.filter(p => p.status === "verified").length, color: "bg-accent" },
                    { label: "Tokenized", count: sellerProperties.filter(p => p.status === "tokenized").length, color: "bg-muted-foreground" },
                    { label: "Listed", count: sellerProperties.filter(p => p.status === "listed").length, color: "bg-[oklch(0.65_0.15_165)]" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-sm">{item.label}</span>
                      </div>
                      <Badge variant="secondary">{item.count}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="opacity-0 animate-slide-in-right animation-delay-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/seller/onboard">
                      <Plus className="mr-2 h-4 w-4" />
                      Onboard New Property
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/seller/documents">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Documents
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/seller/earnings">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      View Earnings
                    </Link>
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
