"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  Vote,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Upload,
  Shield,
  Users,
  AlertTriangle,
  FileText,
  Wallet,
  TrendingUp,
  Bell,
  LogOut,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { usePhantomWallet } from "@/lib/wallet-context"

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  badge?: string
  badgeVariant?: "default" | "secondary" | "destructive"
}

interface NavSection {
  title: string
  items: NavItem[]
}

const investorNavigation: NavSection[] = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Portfolio", href: "/portfolio", icon: Briefcase },
      { title: "Marketplace", href: "/marketplace", icon: Building2 },
    ],
  },
  {
    title: "Invest",
    items: [
      { title: "Watchlist", href: "/watchlist", icon: TrendingUp, badge: "3" },
      { title: "Governance", href: "/governance", icon: Vote, badge: "2", badgeVariant: "secondary" },
    ],
  },
  {
    title: "Account",
    items: [
      { title: "Wallet", href: "/wallet", icon: Wallet },
      { title: "Notifications", href: "/notifications", icon: Bell, badge: "5" },
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
]

const sellerNavigation: NavSection[] = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", href: "/seller", icon: LayoutDashboard },
      { title: "My Properties", href: "/seller/properties", icon: Building2 },
    ],
  },
  {
    title: "Manage",
    items: [
      { title: "Onboard Property", href: "/seller/onboard", icon: Upload },
      { title: "Documents", href: "/seller/documents", icon: FileText },
      { title: "Earnings", href: "/seller/earnings", icon: TrendingUp },
    ],
  },
  {
    title: "Account",
    items: [
      { title: "Settings", href: "/seller/settings", icon: Settings },
      { title: "Help", href: "/help", icon: HelpCircle },
    ],
  },
]

const adminNavigation: NavSection[] = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { title: "Analytics", href: "/admin/analytics", icon: TrendingUp },
    ],
  },
  {
    title: "Management",
    items: [
      { title: "Properties", href: "/admin/properties", icon: Building2, badge: "12", badgeVariant: "secondary" },
      { title: "Users", href: "/admin/users", icon: Users },
      { title: "KYC Review", href: "/admin/kyc", icon: Shield, badge: "8", badgeVariant: "destructive" },
    ],
  },
  {
    title: "Compliance",
    items: [
      { title: "Flagged", href: "/admin/flagged", icon: AlertTriangle, badge: "3", badgeVariant: "destructive" },
      { title: "Disputes", href: "/admin/disputes", icon: FileText },
    ],
  },
]

interface AppSidebarProps {
  variant?: "investor" | "seller" | "admin"
}

export function AppSidebar({ variant = "investor" }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { disconnectWallet } = usePhantomWallet()

  const handleLogout = () => {
    logout()
    disconnectWallet()
    router.push("/")
  }

  const navigation = variant === "admin" 
    ? adminNavigation 
    : variant === "seller" 
      ? sellerNavigation 
      : investorNavigation

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background font-bold text-sm">
            7/12
          </div>
          {!collapsed && (
            <span className="font-semibold text-foreground animate-fade-in">
              Property Token
            </span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="h-[calc(100vh-4rem-64px)]">
        <nav className="p-3 space-y-6">
          {navigation.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  {section.title}
                </p>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors-smooth",
                          isActive
                            ? "bg-secondary text-foreground"
                            : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                          collapsed && "justify-center px-2"
                        )}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="flex-1">{item.title}</span>
                            {item.badge && (
                              <Badge
                                variant={item.badgeVariant || "default"}
                                className="h-5 min-w-[20px] justify-center"
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* User + Logout */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-border p-3">
        {!collapsed && user && (
          <div className="px-3 py-2 mb-1">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium w-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
