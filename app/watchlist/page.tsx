"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { PropertyCard } from "@/components/property-card"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bookmark, TrendingUp, ArrowRight } from "lucide-react"
import { properties } from "@/lib/mock-data"
import { watchlist } from "@/lib/api-client"

export default function WatchlistPage() {
  const [watchedIds, setWatchedIds] = useState<string[]>([])

  useEffect(() => {
    setWatchedIds(watchlist.get())
  }, [])

  const watchedProperties = properties.filter(p => watchedIds.includes(p.id))

  const removeFromWatchlist = (id: string) => {
    watchlist.remove(id)
    setWatchedIds(watchlist.get())
  }

  const avgYield = watchedProperties.length
    ? (watchedProperties.reduce((acc, p) => acc + p.annualYield, 0) / watchedProperties.length).toFixed(1)
    : "0.0"

  const totalValuation = watchedProperties.reduce((acc, p) => acc + p.valuation, 0)

  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`
    return `₹${value.toLocaleString("en-IN")}`
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar variant="investor" />

      <main className="pl-64 transition-all duration-300">
        <DashboardHeader
          title="Watchlist"
          subtitle="Properties you're tracking"
        />

        <div className="p-6 space-y-6">
          {/* Summary Stats */}
          {watchedProperties.length > 0 && (
            <div className="grid grid-cols-3 gap-4 opacity-0 animate-fade-in-up">
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Bookmark className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Watching</p>
                    <p className="text-xl font-semibold">{watchedProperties.length} Properties</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <TrendingUp className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg. Annual Yield</p>
                    <p className="text-xl font-semibold text-[oklch(0.65_0.15_165)]">{avgYield}%</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <ArrowRight className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Valuation</p>
                    <p className="text-xl font-semibold">{formatCurrency(totalValuation)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Property Grid */}
          {watchedProperties.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {watchedProperties.length} saved {watchedProperties.length === 1 ? "property" : "properties"}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    watchedIds.forEach(id => watchlist.remove(id))
                    setWatchedIds([])
                  }}
                >
                  Clear All
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {watchedProperties.map((property, index) => (
                  <div key={property.id} className="relative group">
                    <PropertyCard property={property} index={index} />
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={() => removeFromWatchlist(property.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Card className="opacity-0 animate-fade-in-up">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-muted p-5 mb-4">
                  <Bookmark className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-xl mb-2">Your watchlist is empty</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  Save properties from the marketplace to track their yield, price, and availability here.
                </p>
                <Button asChild>
                  <Link href="/marketplace">
                    Browse Marketplace
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quick add from marketplace hint */}
          {watchedProperties.length > 0 && (
            <Card className="opacity-0 animate-fade-in-up border-dashed">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">Tip</Badge>
                  <p className="text-sm text-muted-foreground">
                    Add more properties from the marketplace to compare yields
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/marketplace">Browse More</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
