"use client"

import { useEffect, useRef, useState } from "react"
import { Shield, BarChart3, Banknote, Clock, FileText, Users } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Verified Properties",
    description: "Every property undergoes rigorous due diligence including legal verification, valuation audit, and compliance checks.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Track your portfolio performance with detailed analytics, yield projections, and market comparisons.",
  },
  {
    icon: Banknote,
    title: "Rental Income",
    description: "Receive your proportional share of rental income directly to your wallet, distributed monthly.",
  },
  {
    icon: Clock,
    title: "Instant Liquidity",
    description: "Trade your property tokens anytime on our secondary marketplace. No lock-in periods.",
  },
  {
    icon: FileText,
    title: "Legal Compliance",
    description: "All properties are structured through SPVs with proper legal documentation and regulatory compliance.",
  },
  {
    icon: Users,
    title: "Governance Rights",
    description: "Participate in major property decisions through token-based voting on maintenance, renovations, and sales.",
  },
]

export function FeaturesSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section id="features" ref={sectionRef} className="py-20 lg:py-28 bg-card border-y border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p 
            className={`text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Features
          </p>
          <h2 
            className={`text-3xl lg:text-4xl font-semibold tracking-tight text-balance transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Everything you need for smart real estate investing
          </h2>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`group relative p-6 lg:p-8 bg-background rounded-2xl border border-border transition-all duration-700 hover-lift ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${200 + index * 75}ms` }}
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-6 transition-all duration-500 group-hover:bg-foreground group-hover:scale-110">
                <feature.icon className="w-6 h-6 text-muted-foreground transition-colors duration-500 group-hover:text-background" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>

              {/* Hover border accent */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent transition-colors duration-500 group-hover:border-foreground/10 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
