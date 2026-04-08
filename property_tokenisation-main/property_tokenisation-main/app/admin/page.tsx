"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import {
  Users, Building2, Shield, AlertTriangle, TrendingUp,
  MoreHorizontal, Check, X, Eye, Clock, CheckCircle2, XCircle, AlertCircle, Zap,
} from "lucide-react"
import { api } from "@/lib/api-client"
import type { AdminUser, AdminProperty } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [properties, setProperties] = useState<AdminProperty[]>([])

  useEffect(() => {
    if (!isLoading && user?.role !== "admin") {
      router.replace("/dashboard")
    }
  }, [user, isLoading])

  const [ticking, setTicking] = useState(false)
  const [tickResult, setTickResult] = useState<string>("")

  const simulatePriceTick = async () => {
    setTicking(true)
    setTickResult("")
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"}/simulate/price-tick`, { method: "POST" })
      const data = await res.json()
      setTickResult(`✅ Prices updated for ${data.ticked} properties`)
    } catch {
      setTickResult("❌ Tick failed")
    } finally {
      setTicking(false)
    }
  }

  const loadData = () => {
    api.admin.users().then(setUsers).catch(() => {})
    api.admin.properties().then(setProperties).catch(() => {})
  }

  useEffect(() => {
    if (user?.role === "admin") loadData()
  }, [user])

  const updatePropertyStatus = async (id: string, status: string) => {
    await api.admin.updatePropertyStatus(id, status)
    loadData()
  }

  const updateKYC = async (id: string, status: string) => {
    await api.admin.updateKYC(id, status)
    loadData()
  }

  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`
    return `₹${value.toLocaleString("en-IN")}`
  }

  const pendingProperties = properties.filter(p => p.status === "pending").length
  const pendingKYC = users.filter(u => u.kycStatus === "pending").length
  const flaggedProperties = properties.filter(p => p.status === "flagged").length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified": case "listed":
        return <Badge className="bg-[oklch(0.65_0.15_165)] hover:bg-[oklch(0.65_0.15_165)]">{status}</Badge>
      case "pending": case "pending_review":
        return <Badge variant="outline" className="border-[oklch(0.75_0.15_80)] text-[oklch(0.75_0.15_80)]">Pending</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      case "flagged":
        return <Badge variant="destructive">Flagged</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getKYCIcon = (status: string) => {
    if (status === "verified") return <CheckCircle2 className="h-4 w-4 text-[oklch(0.65_0.15_165)]" />
    if (status === "pending") return <Clock className="h-4 w-4 text-[oklch(0.75_0.15_80)]" />
    if (status === "rejected") return <XCircle className="h-4 w-4 text-destructive" />
    return <AlertCircle className="h-4 w-4" />
  }

  if (isLoading || user?.role !== "admin") return null

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar variant="admin" />
      <main className="pl-64 transition-all duration-300">
        <DashboardHeader title="Admin Dashboard" subtitle="Platform management and operations" />
        <div className="p-6 space-y-6">

          {/* Simulate Market Button */}
          <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
            <div>
              <p className="text-sm font-medium">Market Simulator</p>
              <p className="text-xs text-muted-foreground">Randomly move all property prices ±3% to simulate live market</p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              {tickResult && <p className="text-sm">{tickResult}</p>}
              <Button onClick={simulatePriceTick} disabled={ticking} className="bg-[oklch(0.65_0.15_165)] hover:bg-[oklch(0.55_0.15_165)]">
                <Zap className="mr-2 h-4 w-4" />
                {ticking ? "Ticking..." : "Simulate Price Tick"}
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Users" value={users.length.toString()} change={15} icon={Users} index={0} />
            <StatCard title="Pending KYC" value={pendingKYC.toString()} icon={Shield}
              variant={pendingKYC > 0 ? "warning" : "default"} index={1} />
            <StatCard title="Pending Properties" value={pendingProperties.toString()} icon={Building2}
              variant={pendingProperties > 0 ? "warning" : "default"} index={2} />
            <StatCard title="Flagged" value={flaggedProperties.toString()} icon={AlertTriangle}
              variant={flaggedProperties > 0 ? "danger" : "default"} index={3} />
          </div>

          <Tabs defaultValue="properties">
            <TabsList>
              <TabsTrigger value="properties">
                Properties {pendingProperties > 0 && <Badge className="ml-2 h-5 w-5 p-0 justify-center">{pendingProperties}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="kyc">
                KYC {pendingKYC > 0 && <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 justify-center">{pendingKYC}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>

            {/* Properties Tab */}
            <TabsContent value="properties">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Property Approval Queue</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Valuation</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {properties.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No properties yet</TableCell>
                        </TableRow>
                      ) : properties.map((property) => (
                        <TableRow key={property.id}>
                          <TableCell className="font-medium">{property.title}</TableCell>
                          <TableCell>{property.owner}</TableCell>
                          <TableCell>{getStatusBadge(property.status)}</TableCell>
                          <TableCell>{formatCurrency(property.valuation)}</TableCell>
                          <TableCell className="text-muted-foreground">{property.submittedDate}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="text-[oklch(0.65_0.15_165)]"
                                  onClick={() => updatePropertyStatus(property.id, "listed")}>
                                  <Check className="mr-2 h-4 w-4" />Approve & List
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updatePropertyStatus(property.id, "verified")}>
                                  <Eye className="mr-2 h-4 w-4" />Verify Only
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive"
                                  onClick={() => updatePropertyStatus(property.id, "rejected")}>
                                  <X className="mr-2 h-4 w-4" />Reject
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-[oklch(0.75_0.15_80)]"
                                  onClick={() => updatePropertyStatus(property.id, "flagged")}>
                                  <AlertTriangle className="mr-2 h-4 w-4" />Flag
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

            {/* KYC Tab */}
            <TabsContent value="kyc">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">KYC Review Queue</CardTitle></CardHeader>
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
                      {users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                <span className="text-sm font-medium">{u.name.split(" ").map(n => n[0]).join("")}</span>
                              </div>
                              <span className="font-medium">{u.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{u.email}</TableCell>
                          <TableCell><Badge variant="secondary" className="capitalize">{u.role}</Badge></TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getKYCIcon(u.kycStatus)}
                              {getStatusBadge(u.kycStatus)}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{u.joinDate}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="text-[oklch(0.65_0.15_165)]"
                                  onClick={() => updateKYC(u.id, "verified")}>
                                  <Check className="mr-2 h-4 w-4" />Approve KYC
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive"
                                  onClick={() => updateKYC(u.id, "rejected")}>
                                  <X className="mr-2 h-4 w-4" />Reject KYC
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
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">All Users</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>KYC</TableHead>
                        <TableHead className="text-right">Invested</TableHead>
                        <TableHead className="text-right">Properties</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.name}</TableCell>
                          <TableCell className="text-muted-foreground">{u.email}</TableCell>
                          <TableCell><Badge variant="secondary" className="capitalize">{u.role}</Badge></TableCell>
                          <TableCell>{getKYCIcon(u.kycStatus)}</TableCell>
                          <TableCell className="text-right">{u.totalInvested > 0 ? formatCurrency(u.totalInvested) : "-"}</TableCell>
                          <TableCell className="text-right">{u.propertiesOwned}</TableCell>
                          <TableCell className="text-muted-foreground">{u.joinDate}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">User Growth</CardTitle></CardHeader>
              <CardContent>
                <div className="h-32 flex items-end gap-1">
                  {[40, 55, 35, 60, 45, 70, 85].map((h, i) => (
                    <div key={i} className="flex-1 bg-accent/20 rounded-t hover:bg-accent/40 transition-all" style={{ height: `${h}%` }} />
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>Mon</span><span>Sun</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Platform Health</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[["API Uptime", "99.9%"], ["Avg Response", "124ms"], ["Error Rate", "0.02%"]].map(([label, val]) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <Badge className="bg-[oklch(0.65_0.15_165)]">{val}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Token Sales</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="text-muted-foreground">Properties Listed</span>
                    <span className="font-medium">{properties.filter(p => p.status === "listed").length}</span>
                  </div>
                  <Progress value={properties.length > 0 ? (properties.filter(p => p.status === "listed").length / properties.length) * 100 : 0} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="text-muted-foreground">Pending Review</span>
                    <span className="font-medium">{pendingProperties}</span>
                  </div>
                  <Progress value={properties.length > 0 ? (pendingProperties / properties.length) * 100 : 0} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
    </div>
  )
}
