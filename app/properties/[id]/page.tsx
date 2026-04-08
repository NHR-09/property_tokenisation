"use client"

import { useState, use } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  MapPin,
  Shield,
  Building2,
  TrendingUp,
  Users,
  Calendar,
  FileText,
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Minus,
  Plus,
  Wallet,
} from "lucide-react"
import { properties } from "@/lib/mock-data"

// Extended property data for details page
const propertyDetails = {
  description: "Premium Grade-A commercial complex featuring modern architecture, high-speed elevators, 24/7 security, and ample parking. Currently leased to top IT companies with long-term contracts ensuring stable rental income.",
  builtYear: 2019,
  totalArea: "125,000 sq ft",
  floors: 12,
  occupancy: 95,
  tenants: ["TCS", "Infosys", "Wipro"],
  amenities: ["24/7 Security", "Power Backup", "High-Speed Lifts", "Cafeteria", "Gym", "Conference Rooms"],
  spvInfo: {
    name: "7/12 Wakad Commercial SPV Pvt Ltd",
    regNumber: "CIN: U70200PN2024PTC123456",
    trustee: "ABC Trustee Services Ltd",
  },
  documents: [
    { name: "Title Deed", status: "verified", date: "2024-01-10" },
    { name: "Property Valuation Report", status: "verified", date: "2024-01-15" },
    { name: "Legal Due Diligence", status: "verified", date: "2024-01-20" },
    { name: "Building Compliance Certificate", status: "verified", date: "2024-01-25" },
    { name: "Rental Agreements", status: "verified", date: "2024-02-01" },
  ],
  transactionHistory: [
    { date: "2024-03-15", type: "Buy", investor: "0x1234...5678", tokens: 100, price: 5000 },
    { date: "2024-03-14", type: "Buy", investor: "0xabcd...ef01", tokens: 250, price: 5000 },
    { date: "2024-03-12", type: "Sell", investor: "0x9876...5432", tokens: 50, price: 4950 },
    { date: "2024-03-10", type: "Buy", investor: "0x5555...4444", tokens: 500, price: 4900 },
  ],
  priceHistory: [] as { month: string; price: number }[], // generated per-property below
  risks: [
    { level: "low", title: "Market Risk", description: "Property located in established IT corridor with stable demand" },
    { level: "low", title: "Liquidity Risk", description: "High trading volume ensures easy exit" },
    { level: "medium", title: "Tenant Concentration", description: "Top 3 tenants occupy 60% of space" },
    { level: "low", title: "Regulatory Risk", description: "Fully compliant with RERA and local regulations" },
  ],
}

const images = [
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=1200&auto=format&fit=crop&q=80",
]

export default function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const property = properties.find(p => p.id === id)
  
  const [currentImage, setCurrentImage] = useState(0)
  const [buyQuantity, setBuyQuantity] = useState(10)
  const [buyDialogOpen, setBuyDialogOpen] = useState(false)

  if (!property) {
    notFound()
  }

  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`
    }
    return `₹${value.toLocaleString('en-IN')}`
  }

  const soldPercentage = ((property.totalTokens - property.availableTokens) / property.totalTokens) * 100
  const estimatedCost = buyQuantity * property.tokenPrice
  const ownershipPercentage = ((buyQuantity / property.totalTokens) * 100).toFixed(4)

  const priceHistory = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"].map((month, i) => ({
    month,
    price: Math.round(property.tokenPrice * (0.90 + i * 0.02))
  }))

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length)
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length)

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar variant="investor" />
      
      <main className="pl-64 transition-all duration-300">
        <DashboardHeader title="Property Details" />

        <div className="p-6">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/marketplace">Marketplace</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{property.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="xl:col-span-2 space-y-6">
              {/* Image Gallery */}
              <Card className="overflow-hidden opacity-0 animate-fade-in-up">
                <div className="relative aspect-[16/9]">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-all duration-500"
                    style={{ backgroundImage: `url(${images[currentImage]})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
                  
                  {/* Navigation */}
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {property.verified && (
                      <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                        <Shield className="mr-1 h-3 w-3 text-[oklch(0.65_0.15_165)]" />
                        Verified Asset
                      </Badge>
                    )}
                    <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                      <Building2 className="mr-1 h-3 w-3" />
                      {property.propertyType}
                    </Badge>
                  </div>

                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
                    {currentImage + 1} / {images.length}
                  </div>
                </div>

                {/* Thumbnails */}
                <div className="flex gap-2 p-4 bg-muted/30">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImage(idx)}
                      className={`relative w-20 h-14 rounded-md overflow-hidden transition-all ${
                        idx === currentImage ? 'ring-2 ring-accent' : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${img})` }}
                      />
                    </button>
                  ))}
                </div>
              </Card>

              {/* Property Summary */}
              <Card className="opacity-0 animate-fade-in-up animation-delay-100">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                    <div>
                      <h1 className="text-2xl font-semibold text-foreground mb-2">
                        {property.title}
                      </h1>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{property.location}, {property.city}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Property Valuation</p>
                      <p className="text-2xl font-semibold text-foreground">
                        {formatCurrency(property.valuation)}
                      </p>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-6">
                    {propertyDetails.description}
                  </p>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Built Year</p>
                      <p className="font-semibold">{propertyDetails.builtYear}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Total Area</p>
                      <p className="font-semibold">{propertyDetails.totalArea}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Floors</p>
                      <p className="font-semibold">{propertyDetails.floors}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Occupancy</p>
                      <p className="font-semibold text-[oklch(0.65_0.15_165)]">{propertyDetails.occupancy}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs */}
              <Tabs defaultValue="overview" className="opacity-0 animate-fade-in-up animation-delay-200">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="ownership">Ownership</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  <TabsTrigger value="risk">Risk & Compliance</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-4 space-y-6">
                  {/* Tenants & Amenities */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Current Tenants</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {propertyDetails.tenants.map((tenant) => (
                            <Badge key={tenant} variant="secondary">{tenant}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Amenities</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {propertyDetails.amenities.map((amenity) => (
                            <Badge key={amenity} variant="outline">{amenity}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* SPV Info */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Legal Structure (SPV)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">SPV Name</span>
                        <span className="font-medium">{propertyDetails.spvInfo.name}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Registration</span>
                        <span className="font-medium">{propertyDetails.spvInfo.regNumber}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Trustee</span>
                        <span className="font-medium">{propertyDetails.spvInfo.trustee}</span>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="ownership" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Ownership Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Ownership Breakdown */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-accent" />
                            <span className="text-sm">Investors</span>
                          </div>
                          <span className="font-medium">{(100 - property.sellerRetained).toFixed(0)}%</span>
                        </div>
                        <Progress value={100 - property.sellerRetained} className="h-3" />
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                            <span className="text-sm">Seller Retained</span>
                          </div>
                          <span className="font-medium">{property.sellerRetained}%</span>
                        </div>
                        <Progress value={property.sellerRetained} className="h-3 [&>div]:bg-muted-foreground" />
                      </div>

                      <Separator />

                      {/* Token Stats */}
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-semibold">{property.totalTokens.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Total Tokens</p>
                        </div>
                        <div>
                          <p className="text-2xl font-semibold text-[oklch(0.65_0.15_165)]">
                            {(property.totalTokens - property.availableTokens).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">Tokens Sold</p>
                        </div>
                        <div>
                          <p className="text-2xl font-semibold">{property.availableTokens.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Available</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="documents" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Verified Documents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {propertyDetails.documents.map((doc) => (
                          <div
                            key={doc.name}
                            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium text-sm">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">Verified on {doc.date}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="secondary" className="text-[oklch(0.65_0.15_165)]">
                                <Check className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                              <Button variant="ghost" size="icon">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="transactions" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Investor</TableHead>
                            <TableHead className="text-right">Tokens</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {propertyDetails.transactionHistory.map((txn, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="text-muted-foreground">{txn.date}</TableCell>
                              <TableCell>
                                <Badge variant={txn.type === "Buy" ? "default" : "secondary"}>
                                  {txn.type}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-sm">{txn.investor}</TableCell>
                              <TableCell className="text-right">{txn.tokens}</TableCell>
                              <TableCell className="text-right">₹{txn.price.toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <Button variant="link" className="mt-4 px-0">
                        View all transactions <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="risk" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Risk Assessment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {propertyDetails.risks.map((risk) => (
                        <div
                          key={risk.title}
                          className="flex items-start gap-4 p-4 rounded-lg border"
                        >
                          <div className={`p-2 rounded-lg ${
                            risk.level === "low" 
                              ? "bg-[oklch(0.65_0.15_165)]/10" 
                              : risk.level === "medium"
                                ? "bg-[oklch(0.75_0.15_80)]/10"
                                : "bg-destructive/10"
                          }`}>
                            <AlertTriangle className={`h-4 w-4 ${
                              risk.level === "low"
                                ? "text-[oklch(0.65_0.15_165)]"
                                : risk.level === "medium"
                                  ? "text-[oklch(0.75_0.15_80)]"
                                  : "text-destructive"
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">{risk.title}</p>
                              <Badge variant="outline" className="text-xs capitalize">
                                {risk.level}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{risk.description}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - Buy Panel */}
            <div className="space-y-6">
              <Card className="sticky top-24 opacity-0 animate-slide-in-right">
                <CardHeader>
                  <CardTitle className="text-lg">Buy Property Tokens</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Token Price */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm text-muted-foreground">Token Price</p>
                      <p className="text-2xl font-semibold">{formatCurrency(property.tokenPrice)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Annual Yield</p>
                      <p className="text-xl font-semibold text-[oklch(0.65_0.15_165)]">
                        {property.annualYield}%
                      </p>
                    </div>
                  </div>

                  {/* Sale Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Token Sale Progress</span>
                      <span className="font-medium">{soldPercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={soldPercentage} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {property.availableTokens.toLocaleString()} tokens available
                    </p>
                  </div>

                  <Separator />

                  {/* Quantity Selector */}
                  <div className="space-y-3">
                    <Label>Number of Tokens</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setBuyQuantity(Math.max(1, buyQuantity - 10))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={buyQuantity}
                        onChange={(e) => setBuyQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="text-center"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setBuyQuantity(buyQuantity + 10)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      {[10, 50, 100, 500].map((qty) => (
                        <Button
                          key={qty}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setBuyQuantity(qty)}
                        >
                          {qty}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Cost Summary */}
                  <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Estimated Cost</span>
                      <span className="font-semibold">{formatCurrency(estimatedCost)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ownership %</span>
                      <span className="font-medium">{ownershipPercentage}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Est. Annual Income</span>
                      <span className="font-medium text-[oklch(0.65_0.15_165)]">
                        {formatCurrency((estimatedCost * property.annualYield) / 100)}
                      </span>
                    </div>
                  </div>

                  {/* Buy Button */}
                  <Dialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full" size="lg">
                        <Wallet className="mr-2 h-4 w-4" />
                        Buy {buyQuantity} Tokens
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm Purchase</DialogTitle>
                        <DialogDescription>
                          You are about to purchase {buyQuantity} tokens of {property.title}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tokens</span>
                            <span className="font-medium">{buyQuantity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Price per Token</span>
                            <span className="font-medium">{formatCurrency(property.tokenPrice)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Platform Fee (1%)</span>
                            <span className="font-medium">{formatCurrency(estimatedCost * 0.01)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between text-lg">
                            <span className="font-semibold">Total</span>
                            <span className="font-semibold">{formatCurrency(estimatedCost * 1.01)}</span>
                          </div>
                        </div>
                        <Button className="w-full" size="lg" onClick={() => setBuyDialogOpen(false)}>
                          Confirm & Pay
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <p className="text-xs text-center text-muted-foreground">
                    By purchasing, you agree to our Terms of Service
                  </p>
                </CardContent>
              </Card>

              {/* Key Stats */}
              <Card className="opacity-0 animate-slide-in-right animation-delay-100">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <TrendingUp className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">ROI (Est. 5yr)</p>
                      <p className="font-semibold">{(property.annualYield * 5).toFixed(1)}%</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <Users className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Investors</p>
                      <p className="font-semibold">847</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <Calendar className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Listed Since</p>
                      <p className="font-semibold">Jan 15, 2024</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
