"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { MapPin, TrendingUp, Shield, Building2, Bookmark } from "lucide-react"
import Link from "next/link"
import { watchlist } from "@/lib/api-client"

export interface Property {
  id: string
  title: string
  location: string
  city: string
  image: string
  valuation: number
  tokenPrice: number
  availableTokens: number
  totalTokens: number
  sellerRetained: number
  annualYield: number
  propertyType: string
  verified: boolean
  featured?: boolean
}

interface PropertyCardProps {
  property: Property
  index?: number
}

export function PropertyCard({ property, index = 0 }: PropertyCardProps) {
  const soldPercentage = ((property.totalTokens - property.availableTokens) / property.totalTokens) * 100
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSaved(watchlist.has(property.id))
  }, [property.id])

  const toggleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault()
    watchlist.toggle(property.id)
    setSaved(watchlist.has(property.id))
  }
  
  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`
    }
    return `₹${value.toLocaleString('en-IN')}`
  }

  return (
    <Card 
      className="group overflow-hidden border-border/60 bg-card hover-lift opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <div 
          className="absolute inset-0 bg-muted bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${property.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {property.verified && (
            <Badge variant="secondary" className="bg-card/90 text-foreground backdrop-blur-sm">
              <Shield className="mr-1 h-3 w-3 text-[oklch(0.65_0.15_165)]" />
              Verified
            </Badge>
          )}
          {property.featured && (
            <Badge className="bg-accent text-accent-foreground">
              Featured
            </Badge>
          )}
        </div>
        
        {/* Property Type + Watchlist */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <Badge variant="outline" className="bg-card/90 backdrop-blur-sm border-0">
            <Building2 className="mr-1 h-3 w-3" />
            {property.propertyType}
          </Badge>
          <button
            onClick={toggleWatchlist}
            className="p-1.5 rounded-full bg-card/90 backdrop-blur-sm hover:bg-card transition-colors"
            title={saved ? "Remove from watchlist" : "Add to watchlist"}
          >
            <Bookmark className={`h-4 w-4 transition-colors ${saved ? "fill-accent text-accent" : "text-muted-foreground"}`} />
          </button>
        </div>
        
        {/* Bottom overlay info */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-semibold text-white text-lg leading-tight line-clamp-1">
            {property.title}
          </h3>
          <div className="flex items-center gap-1 text-white/80 text-sm mt-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>{property.location}, {property.city}</span>
          </div>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-4">
        {/* Valuation & Token Price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Property Valuation</p>
            <p className="font-semibold text-foreground">{formatCurrency(property.valuation)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Token Price</p>
            <p className="font-semibold text-foreground">{formatCurrency(property.tokenPrice)}</p>
          </div>
        </div>
        
        {/* Yield & Retained */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-[oklch(0.65_0.15_165)]" />
            <div>
              <p className="text-xs text-muted-foreground">Annual Yield</p>
              <p className="font-medium text-[oklch(0.65_0.15_165)]">{property.annualYield}%</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Seller Retained</p>
            <p className="font-medium text-foreground">{property.sellerRetained}%</p>
          </div>
        </div>
        
        {/* Token Sale Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Token Sale Progress</span>
            <span className="font-medium text-foreground">{soldPercentage.toFixed(1)}% Sold</span>
          </div>
          <Progress value={soldPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {property.availableTokens.toLocaleString()} of {property.totalTokens.toLocaleString()} tokens available
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full transition-smooth">
          <Link href={`/properties/${property.id}`}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
