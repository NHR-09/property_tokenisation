"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Upload,
  Building2,
  FileText,
  Coins,
  ClipboardCheck,
  User,
  Loader2,
} from "lucide-react"
import { api } from "@/lib/api-client"

const steps = [
  { id: 1, title: "Basic Details", icon: Building2 },
  { id: 2, title: "Ownership", icon: User },
  { id: 3, title: "Valuation", icon: FileText },
  { id: 4, title: "Token Setup", icon: Coins },
  { id: 5, title: "Documents", icon: Upload },
  { id: 6, title: "Review", icon: ClipboardCheck },
]

export default function OnboardPropertyPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [formData, setFormData] = useState({
    // Basic Details
    propertyTitle: "",
    propertyType: "",
    address: "",
    city: "",
    pincode: "",
    description: "",
    builtYear: "",
    totalArea: "",
    floors: "",
    // Ownership
    ownerName: "",
    ownershipType: "",
    coOwners: "",
    registrationNumber: "",
    // Valuation
    marketValue: "",
    rentalIncome: "",
    occupancyRate: "",
    // Token Setup
    tokenPrice: "",
    totalTokens: "",
    retainedPercentage: "",
    // Documents
    documents: [] as string[],
  })

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100

  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitError("")
    try {
      const typeMap: Record<string, string> = {
        commercial: "Commercial", office: "Office",
        residential: "Residential", retail: "Retail", mixed: "Mixed-Use",
      }
      const cityMap: Record<string, string> = {
        pune: "Pune", mumbai: "Mumbai", bangalore: "Bangalore",
        hyderabad: "Hyderabad", delhi: "Delhi NCR",
      }
      const marketValue = parseFloat(formData.marketValue) || 0
      const rentalIncome = parseFloat(formData.rentalIncome) || 0
      const tokenPrice = parseFloat(formData.tokenPrice) || 0
      const totalTokens = parseInt(formData.totalTokens) || 0
      const retained = parseFloat(formData.retainedPercentage) || 20
      const annualYield = marketValue > 0
        ? parseFloat(((rentalIncome * 12 / marketValue) * 100).toFixed(2))
        : 0

      await api.properties.create({
        title: formData.propertyTitle,
        location: formData.address || formData.city,
        city: cityMap[formData.city] || formData.city,
        valuation: marketValue,
        token_price: tokenPrice,
        total_tokens: totalTokens,
        seller_retained: retained,
        annual_yield: annualYield,
        property_type: typeMap[formData.propertyType] as any || "Commercial",
        description: formData.description,
      })
      router.push("/seller?submitted=1")
    } catch (err: any) {
      setSubmitError(err.message || "Submission failed. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar variant="seller" />
      
      <main className="pl-64 transition-all duration-300">
        <DashboardHeader 
          title="Onboard Property"
          subtitle="List your property for tokenization"
        />

        <div className="p-6">
          {/* Progress Steps */}
          <Card className="mb-6 opacity-0 animate-fade-in-up">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                          currentStep > step.id
                            ? "bg-[oklch(0.65_0.15_165)] text-white"
                            : currentStep === step.id
                              ? "bg-accent text-accent-foreground"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {currentStep > step.id ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <step.icon className="h-5 w-5" />
                        )}
                      </div>
                      <span className={`text-xs mt-2 ${
                        currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                      }`}>
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`h-0.5 w-16 mx-2 transition-all duration-300 ${
                        currentStep > step.id ? "bg-[oklch(0.65_0.15_165)]" : "bg-muted"
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <Progress value={progressPercentage} className="h-1" />
            </CardContent>
          </Card>

          {/* Form Content */}
          <Card className="max-w-3xl mx-auto opacity-0 animate-fade-in-up animation-delay-100">
            {/* Step 1: Basic Details */}
            {currentStep === 1 && (
              <>
                <CardHeader>
                  <CardTitle>Basic Property Details</CardTitle>
                  <CardDescription>
                    Enter the basic information about your property
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="propertyTitle">Property Title</Label>
                      <Input
                        id="propertyTitle"
                        placeholder="e.g., Premium Commercial Complex"
                        value={formData.propertyTitle}
                        onChange={(e) => updateFormData("propertyTitle", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="propertyType">Property Type</Label>
                      <Select
                        value={formData.propertyType}
                        onValueChange={(value) => updateFormData("propertyType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="commercial">Commercial</SelectItem>
                          <SelectItem value="office">Office Space</SelectItem>
                          <SelectItem value="residential">Residential</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="mixed">Mixed Use</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Full Address</Label>
                      <Textarea
                        id="address"
                        placeholder="Enter complete property address"
                        value={formData.address}
                        onChange={(e) => updateFormData("address", e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Select
                          value={formData.city}
                          onValueChange={(value) => updateFormData("city", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pune">Pune</SelectItem>
                            <SelectItem value="mumbai">Mumbai</SelectItem>
                            <SelectItem value="bangalore">Bangalore</SelectItem>
                            <SelectItem value="hyderabad">Hyderabad</SelectItem>
                            <SelectItem value="delhi">Delhi NCR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pincode">Pincode</Label>
                        <Input
                          id="pincode"
                          placeholder="411057"
                          value={formData.pincode}
                          onChange={(e) => updateFormData("pincode", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="builtYear">Built Year</Label>
                        <Input
                          id="builtYear"
                          placeholder="2020"
                          value={formData.builtYear}
                          onChange={(e) => updateFormData("builtYear", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="totalArea">Total Area (sq ft)</Label>
                        <Input
                          id="totalArea"
                          placeholder="50000"
                          value={formData.totalArea}
                          onChange={(e) => updateFormData("totalArea", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="floors">Number of Floors</Label>
                        <Input
                          id="floors"
                          placeholder="10"
                          value={formData.floors}
                          onChange={(e) => updateFormData("floors", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your property, its features, amenities, and unique selling points..."
                        rows={4}
                        value={formData.description}
                        onChange={(e) => updateFormData("description", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 2: Ownership */}
            {currentStep === 2 && (
              <>
                <CardHeader>
                  <CardTitle>Ownership Details</CardTitle>
                  <CardDescription>
                    Provide ownership and legal information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ownerName">Property Owner Name</Label>
                      <Input
                        id="ownerName"
                        placeholder="Full legal name as per documents"
                        value={formData.ownerName}
                        onChange={(e) => updateFormData("ownerName", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ownershipType">Ownership Type</Label>
                      <Select
                        value={formData.ownershipType}
                        onValueChange={(value) => updateFormData("ownershipType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select ownership type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sole">Sole Proprietor</SelectItem>
                          <SelectItem value="joint">Joint Ownership</SelectItem>
                          <SelectItem value="company">Company Owned</SelectItem>
                          <SelectItem value="trust">Trust/HUF</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="coOwners">Co-Owners (if any)</Label>
                      <Textarea
                        id="coOwners"
                        placeholder="Enter names and ownership percentages of co-owners"
                        value={formData.coOwners}
                        onChange={(e) => updateFormData("coOwners", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registrationNumber">Property Registration Number</Label>
                      <Input
                        id="registrationNumber"
                        placeholder="As mentioned in registration documents"
                        value={formData.registrationNumber}
                        onChange={(e) => updateFormData("registrationNumber", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 3: Valuation */}
            {currentStep === 3 && (
              <>
                <CardHeader>
                  <CardTitle>Valuation & Income</CardTitle>
                  <CardDescription>
                    Enter property valuation and income details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="marketValue">Estimated Market Value (₹)</Label>
                      <Input
                        id="marketValue"
                        placeholder="e.g., 100000000"
                        value={formData.marketValue}
                        onChange={(e) => updateFormData("marketValue", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        This will be verified by our valuation partner
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rentalIncome">Monthly Rental Income (₹)</Label>
                      <Input
                        id="rentalIncome"
                        placeholder="e.g., 500000"
                        value={formData.rentalIncome}
                        onChange={(e) => updateFormData("rentalIncome", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="occupancyRate">Current Occupancy Rate (%)</Label>
                      <Input
                        id="occupancyRate"
                        placeholder="e.g., 95"
                        value={formData.occupancyRate}
                        onChange={(e) => updateFormData("occupancyRate", e.target.value)}
                      />
                    </div>

                    {formData.marketValue && formData.rentalIncome && (
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground mb-1">Estimated Annual Yield</p>
                        <p className="text-2xl font-semibold text-[oklch(0.65_0.15_165)]">
                          {((parseFloat(formData.rentalIncome) * 12 / parseFloat(formData.marketValue)) * 100).toFixed(2)}%
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 4: Token Setup */}
            {currentStep === 4 && (
              <>
                <CardHeader>
                  <CardTitle>Token Configuration</CardTitle>
                  <CardDescription>
                    Configure how your property tokens will be structured
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="tokenPrice">Token Price (₹)</Label>
                      <Input
                        id="tokenPrice"
                        placeholder="e.g., 5000"
                        value={formData.tokenPrice}
                        onChange={(e) => updateFormData("tokenPrice", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Minimum ₹1,000 - Maximum ₹50,000 per token
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="totalTokens">Total Tokens to Issue</Label>
                      <Input
                        id="totalTokens"
                        placeholder="e.g., 20000"
                        value={formData.totalTokens}
                        onChange={(e) => updateFormData("totalTokens", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="retainedPercentage">Percentage to Retain (%)</Label>
                      <Input
                        id="retainedPercentage"
                        placeholder="e.g., 20"
                        value={formData.retainedPercentage}
                        onChange={(e) => updateFormData("retainedPercentage", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Minimum 10% must be retained by the seller
                      </p>
                    </div>

                    {formData.tokenPrice && formData.totalTokens && (
                      <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Token Value</span>
                          <span className="font-medium">
                            ₹{(parseFloat(formData.tokenPrice) * parseFloat(formData.totalTokens)).toLocaleString('en-IN')}
                          </span>
                        </div>
                        {formData.retainedPercentage && (
                          <>
                            <Separator />
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Tokens for Sale</span>
                              <span className="font-medium">
                                {Math.floor(parseFloat(formData.totalTokens) * (1 - parseFloat(formData.retainedPercentage) / 100)).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Potential Funds Raised</span>
                              <span className="font-medium text-[oklch(0.65_0.15_165)]">
                                ₹{Math.floor(parseFloat(formData.tokenPrice) * parseFloat(formData.totalTokens) * (1 - parseFloat(formData.retainedPercentage) / 100)).toLocaleString('en-IN')}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 5: Documents */}
            {currentStep === 5 && (
              <>
                <CardHeader>
                  <CardTitle>Document Upload</CardTitle>
                  <CardDescription>
                    Upload required documents for verification
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {[
                      { name: "Title Deed / Sale Deed", required: true },
                      { name: "Property Tax Receipts", required: true },
                      { name: "Building Plan Approval", required: true },
                      { name: "Occupancy Certificate", required: true },
                      { name: "Encumbrance Certificate", required: true },
                      { name: "Rental Agreements (if any)", required: false },
                      { name: "Property Photos", required: true },
                    ].map((doc) => (
                      <div
                        key={doc.name}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.required ? "Required" : "Optional"}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Upload className="mr-2 h-4 w-4" />
                          Upload
                        </Button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Accepted formats: PDF, JPG, PNG. Maximum file size: 10MB
                  </p>
                </CardContent>
              </>
            )}

            {/* Step 6: Review */}
            {currentStep === 6 && (
              <>
                <CardHeader>
                  <CardTitle>Review & Submit</CardTitle>
                  <CardDescription>
                    Review your property details before submission
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Property Details</h4>
                        <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>
                          Edit
                        </Button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Title</span>
                          <span>{formData.propertyTitle || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type</span>
                          <span className="capitalize">{formData.propertyType || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Location</span>
                          <span className="capitalize">{formData.city || "-"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Token Configuration</h4>
                        <Button variant="ghost" size="sm" onClick={() => setCurrentStep(4)}>
                          Edit
                        </Button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Token Price</span>
                          <span>₹{formData.tokenPrice || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Tokens</span>
                          <span>{formData.totalTokens || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Retained</span>
                          <span>{formData.retainedPercentage || "-"}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-start gap-3">
                        <input type="checkbox" className="mt-1" />
                        <p className="text-sm text-muted-foreground">
                          I confirm that all the information provided is accurate and I have the legal authority to tokenize this property. I agree to the Terms of Service and Privacy Policy.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between p-6 pt-0">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              {submitError && (
                <p className="text-sm text-destructive">{submitError}</p>
              )}

              {currentStep < steps.length ? (
                <Button onClick={nextStep}>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  className="bg-[oklch(0.65_0.15_165)] hover:bg-[oklch(0.55_0.15_165)]"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {submitting ? "Submitting..." : "Submit for Review"}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
