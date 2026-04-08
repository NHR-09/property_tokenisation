"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { PropertyCard } from "@/components/property-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Search, SlidersHorizontal, X, LayoutGrid, List } from "lucide-react"
import { api } from "@/lib/api-client"
import type { Property } from "@/lib/api-client"

const cities = ["All Cities", "Pune", "Mumbai", "Bangalore", "Hyderabad"]
const propertyTypes = ["Commercial", "Office", "Residential", "Retail", "Mixed-Use"]

export default function MarketplacePage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loadingProps, setLoadingProps] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState("All Cities")
  const [sortBy, setSortBy] = useState("featured")
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [yieldRange, setYieldRange] = useState([0, 15])
  const [priceRange, setPriceRange] = useState([0, 20000])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    const fetchProps = () => {
      api.properties.list()
        .then(setProperties)
        .catch(() => setProperties([]))
        .finally(() => setLoadingProps(false))
    }
    fetchProps()
    window.addEventListener("focus", fetchProps)
    return () => window.removeEventListener("focus", fetchProps)
  }, [])

  const togglePropertyType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const clearFilters = () => {
    setSelectedTypes([])
    setYieldRange([0, 15])
    setPriceRange([0, 20000])
    setSelectedCity("All Cities")
  }

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.city.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCity = selectedCity === "All Cities" || property.city === selectedCity
    
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(property.propertyType)
    
    const matchesYield = property.annualYield >= yieldRange[0] && property.annualYield <= yieldRange[1]
    
    const matchesPrice = property.tokenPrice >= priceRange[0] && property.tokenPrice <= priceRange[1]

    return matchesSearch && matchesCity && matchesType && matchesYield && matchesPrice
  })

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (sortBy) {
      case "yield-high":
        return b.annualYield - a.annualYield
      case "yield-low":
        return a.annualYield - b.annualYield
      case "price-high":
        return b.tokenPrice - a.tokenPrice
      case "price-low":
        return a.tokenPrice - b.tokenPrice
      case "featured":
      default:
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
    }
  })

  const activeFiltersCount = selectedTypes.length + 
    (yieldRange[0] > 0 || yieldRange[1] < 15 ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 20000 ? 1 : 0)

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Property Type */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Property Type</Label>
        <div className="space-y-2">
          {propertyTypes.map(type => (
            <div key={type} className="flex items-center gap-2">
              <Checkbox
                id={type}
                checked={selectedTypes.includes(type)}
                onCheckedChange={() => togglePropertyType(type)}
              />
              <label htmlFor={type} className="text-sm cursor-pointer">
                {type}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Annual Yield */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Annual Yield</Label>
          <span className="text-sm text-muted-foreground">
            {yieldRange[0]}% - {yieldRange[1]}%
          </span>
        </div>
        <Slider
          value={yieldRange}
          onValueChange={setYieldRange}
          min={0}
          max={15}
          step={0.5}
          className="w-full"
        />
      </div>

      {/* Token Price */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Token Price</Label>
          <span className="text-sm text-muted-foreground">
            ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
          </span>
        </div>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          min={0}
          max={20000}
          step={500}
          className="w-full"
        />
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          Clear All Filters
        </Button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar variant="investor" />
      
      <main className="pl-64 transition-all duration-300">
        <DashboardHeader 
          title="Property Marketplace"
          subtitle="Discover verified tokenized real estate investments"
        />

        <div className="p-6">
          {/* Search and Controls */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by property name, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* City Filter */}
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured First</SelectItem>
                <SelectItem value="yield-high">Yield: High to Low</SelectItem>
                <SelectItem value="yield-low">Yield: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="rounded-none"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="rounded-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Filters */}
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden relative">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-2 h-5 w-5 p-0 justify-center">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-6 animate-fade-in">
              {selectedTypes.map(type => (
                <Badge key={type} variant="secondary" className="pl-2 pr-1 py-1">
                  {type}
                  <button
                    onClick={() => togglePropertyType(type)}
                    className="ml-1 hover:bg-foreground/10 rounded p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {(yieldRange[0] > 0 || yieldRange[1] < 15) && (
                <Badge variant="secondary" className="pl-2 pr-1 py-1">
                  Yield: {yieldRange[0]}%-{yieldRange[1]}%
                  <button
                    onClick={() => setYieldRange([0, 15])}
                    className="ml-1 hover:bg-foreground/10 rounded p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}

          <div className="flex gap-6">
            {/* Desktop Sidebar Filters */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 rounded-lg border bg-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Filters</h3>
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary">{activeFiltersCount}</Badge>
                  )}
                </div>
                <FilterContent />
              </div>
            </aside>

            {/* Properties Grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  Showing {sortedProperties.length} properties
                </p>
              </div>

              {sortedProperties.length > 0 ? (
                <div className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "space-y-4"
                }>
                  {sortedProperties.map((property, index) => (
                    <PropertyCard key={property.id} property={property} index={index} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">No properties found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or search query
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
