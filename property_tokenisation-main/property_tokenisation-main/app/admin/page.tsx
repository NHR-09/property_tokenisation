"use client"

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  Building2,
  Shield,
  AlertTriangle,
  FileText,
  TrendingUp,
  MoreHorizontal,
  Check,
  X,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { adminUsers, adminProperties } from "@/lib/mock-data"

export default function AdminDashboardPage() {
  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`
    }
    return `₹${value.toLocaleString('en-IN')}`
  }

  const pendingKYC = adminUsers.filter(u => u.kycStatus === "pending").length
  const pendingProperties = adminProperties.filter(p => p.status === "pending_review").length
  const flaggedProperties = adminProperties.filter(p => p.status === "flagged").length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-[oklch(0.65_0.15_165)] hover:bg-[oklch(0.65_0.15_165)]">Verified</Badge>
      case "pending":
      case "pending_review":
        return <Badge variant="outline" className="border-[oklch(0.75_0.15_80)] text-[oklch(0.75_0.15_80)]">Pending</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      case "flagged":
        return <Badge variant="destructive">Flagged</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getKYCStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle2 className="h-4 w-4 text-[oklch(0.65_0.15_165)]" />
      case "pending":
        return <Clock className="h-4 w-4 text-[oklch(0.75_0.15_80)]" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-destructive" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar variant="admin" />
      
      <main className="pl-64 transition-all duration-300">
        <DashboardHeader 
          title="Admin Dashboard"
          subtitle="Platform management and operations"
        />

        <div className="p-6 space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Total Users"
              value={adminUsers.length.toString()}
              change={15}
              changeLabel="this month"
              icon={Users}
              index={0}
            />
            <StatCard
              title="Pending KYC"
              value={pendingKYC.toString()}
              icon={Shield}
              variant={pendingKYC > 0 ? "warning" : "default"}
              index={1}
            />
            <StatCard
              title="Properties Pending"
              value={pendingProperties.toString()}
              icon={Building2}
              variant={pendingProperties > 0 ? "warning" : "default"}
              index={2}
            />
            <StatCard
              title="Flagged Items"
              value={flaggedProperties.toString()}
              icon={AlertTriangle}
              variant={flaggedProperties > 0 ? "danger" : "default"}
              index={3}
            />
            <StatCard
              title="Platform Volume"
              value="₹45.2 Cr"
              change={22}
              icon={TrendingUp}
              variant="success"
              index={4}
            />
          </div>

          {/* Tabs for different sections */}
          <Tabs defaultValue="properties" className="space-y-4">
            <TabsList>
              <TabsTrigger value="properties" className="relative">
                Properties
                {pendingProperties > 0 && (
                  <Badge className="ml-2 h-5 w-5 p-0 justify-center">{pendingProperties}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="kyc" className="relative">
                KYC Review
                {pendingKYC > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 justify-center">{pendingKYC}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="flagged" className="relative">
                Flagged
                {flaggedProperties > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 justify-center">{flaggedProperties}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Properties Tab */}
            <TabsContent value="properties">
              <Card className="opacity-0 animate-fade-in-up">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base">Property Approval Queue</CardTitle>
                  <Button variant="outline" size="sm">Export</Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Valuation</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Verification</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminProperties.map((property, index) => (
                        <TableRow 
                          key={property.id}
                          className="opacity-0 animate-fade-in-up"
                          style={{ animationDelay: `${(index + 1) * 100}ms`, animationFillMode: 'forwards' }}
                        >
                          <TableCell>
                            <p className="font-medium">{property.title}</p>
                          </TableCell>
                          <TableCell>{property.owner}</TableCell>
                          <TableCell>{getStatusBadge(property.status)}</TableCell>
                          <TableCell>{formatCurrency(property.valuation)}</TableCell>
                          <TableCell className="text-muted-foreground">{property.submittedDate}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs">
                                {property.documentsComplete ? (
                                  <Check className="h-3 w-3 text-[oklch(0.65_0.15_165)]" />
                                ) : (
                                  <X className="h-3 w-3 text-destructive" />
                                )}
                                <span>Documents</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                {property.legalCleared ? (
                                  <Check className="h-3 w-3 text-[oklch(0.65_0.15_165)]" />
                                ) : (
                                  <X className="h-3 w-3 text-destructive" />
                                )}
                                <span>Legal</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-[oklch(0.65_0.15_165)]">
                                  <Check className="mr-2 h-4 w-4" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <X className="mr-2 h-4 w-4" />
                                  Reject
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-[oklch(0.75_0.15_80)]">
                                  <AlertTriangle className="mr-2 h-4 w-4" />
                                  Flag for Review
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* KYC Review Tab */}
            <TabsContent value="kyc">
              <Card className="opacity-0 animate-fade-in-up">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base">KYC Review Queue</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Bulk Approve</Button>
                    <Button variant="outline" size="sm">Export</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>KYC Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminUsers.map((user, index) => (
                        <TableRow 
                          key={user.id}
                          className="opacity-0 animate-fade-in-up"
                          style={{ animationDelay: `${(index + 1) * 100}ms`, animationFillMode: 'forwards' }}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                <span className="text-sm font-medium">
                                  {user.name.split(" ").map(n => n[0]).join("")}
                                </span>
                              </div>
                              <span className="font-medium">{user.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize">{user.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getKYCStatusIcon(user.kycStatus)}
                              {getStatusBadge(user.kycStatus)}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{user.joinDate}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Documents
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-[oklch(0.65_0.15_165)]">
                                  <Check className="mr-2 h-4 w-4" />
                                  Approve KYC
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <X className="mr-2 h-4 w-4" />
                                  Reject KYC
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card className="opacity-0 animate-fade-in-up">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base">All Users</CardTitle>
                  <Button variant="outline" size="sm">Export</Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>KYC</TableHead>
                        <TableHead className="text-right">Total Invested</TableHead>
                        <TableHead className="text-right">Properties</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminUsers.map((user, index) => (
                        <TableRow 
                          key={user.id}
                          className="opacity-0 animate-fade-in-up"
                          style={{ animationDelay: `${(index + 1) * 100}ms`, animationFillMode: 'forwards' }}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                <span className="text-sm font-medium">
                                  {user.name.split(" ").map(n => n[0]).join("")}
                                </span>
                              </div>
                              <span className="font-medium">{user.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize">{user.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getKYCStatusIcon(user.kycStatus)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {user.totalInvested > 0 ? formatCurrency(user.totalInvested) : "-"}
                          </TableCell>
                          <TableCell className="text-right">{user.propertiesOwned}</TableCell>
                          <TableCell className="text-muted-foreground">{user.joinDate}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Flagged Tab */}
            <TabsContent value="flagged">
              <Card className="opacity-0 animate-fade-in-up">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Flagged Items</CardTitle>
                </CardHeader>
                <CardContent>
                  {flaggedProperties > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Flagged On</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adminProperties
                          .filter(p => p.status === "flagged")
                          .map((property, index) => (
                            <TableRow 
                              key={property.id}
                              className="opacity-0 animate-fade-in-up"
                              style={{ animationDelay: `${(index + 1) * 100}ms`, animationFillMode: 'forwards' }}
                            >
                              <TableCell className="font-medium">{property.title}</TableCell>
                              <TableCell>
                                <Badge variant="outline">Property</Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                Suspicious valuation discrepancy
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {property.submittedDate}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline">
                                    <Eye className="mr-2 h-4 w-4" />
                                    Review
                                  </Button>
                                  <Button size="sm" variant="destructive">
                                    Freeze
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="rounded-full bg-[oklch(0.65_0.15_165)]/10 p-4 mb-4">
                        <Check className="h-8 w-8 text-[oklch(0.65_0.15_165)]" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">All Clear</h3>
                      <p className="text-muted-foreground">
                        No flagged items require attention
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Analytics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="opacity-0 animate-fade-in-up animation-delay-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 flex items-end gap-1">
                  {[40, 55, 35, 60, 45, 70, 85].map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-accent/20 rounded-t transition-all duration-500 hover:bg-accent/40"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>Mon</span>
                  <span>Sun</span>
                </div>
              </CardContent>
            </Card>

            <Card className="opacity-0 animate-fade-in-up animation-delay-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Transaction Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Today</span>
                      <span className="text-sm font-medium">₹2.4 Cr</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">This Week</span>
                      <span className="text-sm font-medium">₹12.8 Cr</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">This Month</span>
                      <span className="text-sm font-medium">₹45.2 Cr</span>
                    </div>
                    <Progress value={90} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="opacity-0 animate-fade-in-up animation-delay-400">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Platform Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">API Uptime</span>
                  <Badge className="bg-[oklch(0.65_0.15_165)]">99.9%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg Response</span>
                  <Badge variant="secondary">124ms</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Error Rate</span>
                  <Badge className="bg-[oklch(0.65_0.15_165)]">0.02%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Sessions</span>
                  <Badge variant="secondary">1,247</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
