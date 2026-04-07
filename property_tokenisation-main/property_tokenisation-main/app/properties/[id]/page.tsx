"use client"

import { useState, use, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  MapPin, Shield, Building2, TrendingUp, Users, Calendar,
  FileText, AlertTriangle, Check, ChevronLeft, ChevronRight,
  Download, Minus, Plus, Wallet, Loader2,
} from "lucide-react"
import { api } from "@/lib/api-client"
import type { Property } from "@/lib/api-client"
import { usePhantomWallet } from "@/lib/wallet-context"

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
  const router = useRouter()

  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImage, setCurrentImage] = useState(0)
  const [buyQuantity, setBuyQuantity] = useState(10)
  const [buyDialogOpen, setBuyDialogOpen] = useState(false)
  const [buying, setBuying] = useState(false)
  const [buySuccess, setBuySuccess] = useState(false)
  const [buyError, setBuyError] = useState("")
  const { walletAddress, connected } = usePhantomWallet()

  useEffect(() => {
    api.properties.get(id)
      .then(setProperty)
      .catch(() => router.push("/marketplace"))
      .finally(() => setLoading(false))
  }, [id])

  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`
    return `₹${value.toLocaleString('en-IN')}`
  }

  const handleBuy = async () => {
    setBuying(true)
    setBuyError("")
    try {
      // Step 1: create order
      const order = await api.payments.createOrder(id, buyQuantity)
      // Step 2: simulate payment
      const payment = await api.payments.simulate(order.order_id)
      // Step 3: confirm purchase — use connected wallet if available
      await api.tokens.purchase({
        property_id: id,
        quantity: buyQuantity,
        payment_method: connected && walletAddress ? "crypto" : "fiat",
        wallet_address: walletAddress ?? undefined,
        razorpay_payment_id: connected ? undefined : payment.payment_id,
      })
      setBuySuccess(true)
    } catch (err: any) {
      setBuyError(err.message || "Purchase failed")
    } finally {
      setBuying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!property) return null

  const soldPercentage = ((property.totalTokens - property.availableTokens) / property.totalTokens) * 100
  const estimatedCost = buyQuantity * property.tokenPrice
  const ownershipPercentage = ((buyQuantity / property.totalTokens) * 100).toFixed(4)

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar variant="investor" />
      <main className="pl-64 transition-all duration-300">
        <DashboardHeader title="Property Details" />
        <div className="p-6">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild><Link href="/marketplace">Marketplace</Link></BreadcrumbLink>
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
              <Card className="overflow-hidden">
                <div className="relative aspect-[16/9]">
                  <div className="absolute inset-0 bg-cover bg-center transition-all duration-500"
                    style={{ backgroundImage: `url(${property.image || images[currentImage]})` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
                  <Button variant="secondary" size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                    onClick={() => setCurrentImage((prev) => (prev - 1 + images.length) % images.length)}>
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button variant="secondary" size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                    onClick={() => setCurrentImage((prev) => (prev + 1) % images.length)}>
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                  <div className="absolute top-4 left-4 flex gap-2">
                    {property.verified && (
                      <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                        <Shield className="mr-1 h-3 w-3 text-[oklch(0.65_0.15_165)]" /> Verified Asset
                      </Badge>
                    )}
                    <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                      <Building2 className="mr-1 h-3 w-3" />{property.propertyType}
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Property Summary */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                    <div>
                      <h1 className="text-2xl font-semibold mb-2">{property.title}</h1>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{property.location}, {property.city}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Property Valuation</p>
                      <p className="text-2xl font-semibold">{formatCurrency(property.valuation)}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-6">{propertyDetails.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Built Year", value: propertyDetails.builtYear },
                      { label: "Total Area", value: propertyDetails.totalArea },
                      { label: "Floors", value: propertyDetails.floors },
                      { label: "Occupancy", value: `${propertyDetails.occupancy}%` },
                    ].map(item => (
                      <div key={item.label} className="p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                        <p className="font-semibold">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tabs */}
              <Tabs defaultValue="overview">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="ownership">Ownership</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="risk">Risk</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-4 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-3"><CardTitle className="text-base">Tenants</CardTitle></CardHeader>
                      <CardContent className="flex flex-wrap gap-2">
                        {propertyDetails.tenants.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3"><CardTitle className="text-base">Amenities</CardTitle></CardHeader>
                      <CardContent className="flex flex-wrap gap-2">
                        {propertyDetails.amenities.map(a => <Badge key={a} variant="outline">{a}</Badge>)}
                      </CardContent>
                    </Card>
                  </div>
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-base">Legal Structure (SPV)</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { label: "SPV Name", value: propertyDetails.spvInfo.name },
                        { label: "Registration", value: propertyDetails.spvInfo.regNumber },
                        { label: "Trustee", value: propertyDetails.spvInfo.trustee },
                      ].map((item, i) => (
                        <div key={i}>
                          {i > 0 && <Separator className="mb-3" />}
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{item.label}</span>
                            <span className="font-medium">{item.value}</span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="ownership" className="mt-4">
                  <Card>
                    <CardHeader><CardTitle className="text-base">Ownership Distribution</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1 text-sm">
                          <span>Investors</span><span>{(100 - property.sellerRetained).toFixed(0)}%</span>
                        </div>
                        <Progress value={100 - property.sellerRetained} className="h-3" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1 text-sm">
                          <span>Seller Retained</span><span>{property.sellerRetained}%</span>
                        </div>
                        <Progress value={property.sellerRetained} className="h-3 [&>div]:bg-muted-foreground" />
                      </div>
                      <Separator />
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div><p className="text-2xl font-semibold">{property.totalTokens.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total</p></div>
                        <div><p className="text-2xl font-semibold text-[oklch(0.65_0.15_165)]">{(property.totalTokens - property.availableTokens).toLocaleString()}</p><p className="text-xs text-muted-foreground">Sold</p></div>
                        <div><p className="text-2xl font-semibold">{property.availableTokens.toLocaleString()}</p><p className="text-xs text-muted-foreground">Available</p></div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="documents" className="mt-4">
                  <Card>
                    <CardHeader><CardTitle className="text-base">Verified Documents</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {propertyDetails.documents.map(doc => (
                        <div key={doc.name} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">Verified on {doc.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[oklch(0.65_0.15_165)]">
                              <Check className="h-3 w-3 mr-1" />Verified
                            </Badge>
                            <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="risk" className="mt-4">
                  <Card>
                    <CardHeader><CardTitle className="text-base">Risk Assessment</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      {propertyDetails.risks.map(risk => (
                        <div key={risk.title} className="flex items-start gap-4 p-4 rounded-lg border">
                          <div className={`p-2 rounded-lg ${risk.level === "low" ? "bg-[oklch(0.65_0.15_165)]/10" : "bg-[oklch(0.75_0.15_80)]/10"}`}>
                            <AlertTriangle className={`h-4 w-4 ${risk.level === "low" ? "text-[oklch(0.65_0.15_165)]" : "text-[oklch(0.75_0.15_80)]"}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">{risk.title}</p>
                              <Badge variant="outline" className="text-xs capitalize">{risk.level}</Badge>
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

            {/* Buy Panel */}
            <div className="space-y-6">
              <Card className="sticky top-24">
                <CardHeader><CardTitle className="text-lg">Buy Property Tokens</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm text-muted-foreground">Token Price</p>
                      <p className="text-2xl font-semibold">{formatCurrency(property.tokenPrice)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Annual Yield</p>
                      <p className="text-xl font-semibold text-[oklch(0.65_0.15_165)]">{property.annualYield}%</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Token Sale Progress</span>
                      <span className="font-medium">{soldPercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={soldPercentage} className="h-2" />
                    <p className="text-xs text-muted-foreground">{property.availableTokens.toLocaleString()} tokens available</p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label>Number of Tokens</Label>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => setBuyQuantity(Math.max(1, buyQuantity - 10))}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input type="number" value={buyQuantity}
                        onChange={e => setBuyQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="text-center" />
                      <Button variant="outline" size="icon" onClick={() => setBuyQuantity(buyQuantity + 10)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      {[10, 50, 100, 500].map(qty => (
                        <Button key={qty} variant="outline" size="sm" className="flex-1" onClick={() => setBuyQuantity(qty)}>{qty}</Button>
                      ))}
                    </div>
                  </div>

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

                  <Dialog open={buyDialogOpen} onOpenChange={v => { setBuyDialogOpen(v); if (!v) { setBuySuccess(false); setBuyError("") } }}>
                    <DialogTrigger asChild>
                      <Button className="w-full" size="lg">
                        <Wallet className="mr-2 h-4 w-4" />Buy {buyQuantity} Tokens
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{buySuccess ? "Purchase Successful! 🎉" : "Confirm Purchase"}</DialogTitle>
                        <DialogDescription>
                          {buySuccess ? `You now own ${buyQuantity} tokens of ${property.title}` : `You are about to purchase ${buyQuantity} tokens of ${property.title}`}
                        </DialogDescription>
                      </DialogHeader>
                      {!buySuccess ? (
                        <div className="space-y-4 py-4">
                          <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                            <div className="flex justify-between"><span className="text-muted-foreground">Tokens</span><span className="font-medium">{buyQuantity}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Price per Token</span><span className="font-medium">{formatCurrency(property.tokenPrice)}</span></div>
                            <Separator />
                            <div className="flex justify-between"><span className="text-muted-foreground">Platform Fee (1%)</span><span className="font-medium">{formatCurrency(estimatedCost * 0.01)}</span></div>
                            <Separator />
                            <div className="flex justify-between text-lg"><span className="font-semibold">Total</span><span className="font-semibold">{formatCurrency(estimatedCost * 1.01)}</span></div>
                          </div>
                          {buyError && <p className="text-sm text-destructive text-center">{buyError}</p>}
                          <Button className="w-full" size="lg" onClick={handleBuy} disabled={buying}>
                            {buying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {buying ? "Processing..." : "Confirm & Pay"}
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4 py-4">
                          <div className="p-4 rounded-lg bg-[oklch(0.65_0.15_165)]/10 text-center">
                            <p className="text-2xl font-semibold text-[oklch(0.65_0.15_165)]">{buyQuantity} Tokens</p>
                            <p className="text-sm text-muted-foreground mt-1">Added to your portfolio</p>
                          </div>
                          <Button className="w-full" onClick={() => { setBuyDialogOpen(false); router.push("/portfolio") }}>
                            View Portfolio
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  <p className="text-xs text-center text-muted-foreground">By purchasing, you agree to our Terms of Service</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 space-y-4">
                  {[
                    { icon: TrendingUp, label: "ROI (Est. 5yr)", value: `${(property.annualYield * 5).toFixed(1)}%` },
                    { icon: Users, label: "Total Investors", value: "847" },
                    { icon: Calendar, label: "Listed Since", value: "Jan 2024" },
                  ].map((item, i) => (
                    <div key={i}>
                      {i > 0 && <Separator />}
                      <div className="flex items-center gap-3 pt-2">
                        <div className="p-2 rounded-lg bg-accent/10">
                          <item.icon className="h-4 w-4 text-accent" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{item.label}</p>
                          <p className="font-semibold">{item.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
