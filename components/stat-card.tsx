"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  change?: number
  changeLabel?: string
  icon?: React.ElementType
  variant?: "default" | "success" | "warning" | "danger"
  className?: string
  index?: number
}

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  variant = "default",
  className,
  index = 0,
}: StatCardProps) {
  const getTrendIcon = () => {
    if (change === undefined) return null
    if (change > 0) return <TrendingUp className="h-3.5 w-3.5" />
    if (change < 0) return <TrendingDown className="h-3.5 w-3.5" />
    return <Minus className="h-3.5 w-3.5" />
  }

  const getTrendColor = () => {
    if (change === undefined) return "text-muted-foreground"
    if (change > 0) return "text-[oklch(0.65_0.15_165)]"
    if (change < 0) return "text-destructive"
    return "text-muted-foreground"
  }

  const getIconBgColor = () => {
    switch (variant) {
      case "success":
        return "bg-[oklch(0.65_0.15_165)]/10 text-[oklch(0.65_0.15_165)]"
      case "warning":
        return "bg-[oklch(0.75_0.15_80)]/10 text-[oklch(0.75_0.15_80)]"
      case "danger":
        return "bg-destructive/10 text-destructive"
      default:
        return "bg-accent/10 text-accent"
    }
  }

  return (
    <Card 
      className={cn(
        "border-border/60 opacity-0 animate-fade-in-up",
        className
      )}
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold text-foreground">{value}</p>
            {change !== undefined && (
              <div className={cn("flex items-center gap-1 text-sm", getTrendColor())}>
                {getTrendIcon()}
                <span>{change > 0 ? '+' : ''}{change}%</span>
                {changeLabel && (
                  <span className="text-muted-foreground">{changeLabel}</span>
                )}
              </div>
            )}
          </div>
          {Icon && (
            <div className={cn("rounded-lg p-2.5", getIconBgColor())}>
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
