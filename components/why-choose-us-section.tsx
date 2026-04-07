"use client"

import { useEffect, useRef, useState } from "react"
import { Check } from "lucide-react"

const benefits = [
  "Low minimum investment of ₹5,000",
  "No property management hassles",
  "Diversify across multiple properties",
  "Monthly rental income distributions",
  "Full transparency on all costs",
  "Secondary market for liquidity",
]

const comparisons = [
  {
    aspect: "Minimum Investment",
    traditional: "₹50 Lakh+",
    platform: "₹5,000",
  },
  {
    aspect: "Liquidity",
    traditional: "Months to years",
    platform: "Instant trading",
  },
  {
    aspect: "Diversification",
    traditional: "Single property",
    platform: "Multiple properties",
  },
  {
    aspect: "Management",
    traditional: "Owner responsibility",
    platform: "Fully managed",
  },
  {
    aspect: "Transparency",
    traditional: "Limited visibility",
    platform: "Real-time data",
  },
]

export function WhyChooseUsSection() {
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
    <section id="why-us" ref={sectionRef} className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <div>
              <p 
                className={`text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 transition-all duration-700 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                Why Choose Us
              </p>
              <h2 
                className={`text-3xl lg:text-4xl font-semibold tracking-tight text-balance transition-all duration-700 delay-100 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                A smarter way to invest in real estate
              </h2>
            </div>

            <p 
              className={`text-lg text-muted-foreground leading-relaxed transition-all duration-700 delay-200 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              Traditional real estate investing requires significant capital, involves lengthy processes, 
              and lacks liquidity. We&apos;re changing that with blockchain-powered fractional ownership.
            </p>

            {/* Benefits list */}
            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <li
                  key={benefit}
                  className={`flex items-center gap-4 transition-all duration-700 ${
                    isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                  }`}
                  style={{ transitionDelay: `${300 + index * 75}ms` }}
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right - Comparison table */}
          <div 
            className={`transition-all duration-700 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-3 bg-secondary">
                <div className="p-4 lg:p-6">
                  <span className="text-sm font-medium text-muted-foreground">Aspect</span>
                </div>
                <div className="p-4 lg:p-6 text-center border-l border-border">
                  <span className="text-sm font-medium text-muted-foreground">Traditional</span>
                </div>
                <div className="p-4 lg:p-6 text-center border-l border-border bg-foreground text-background">
                  <span className="text-sm font-medium">7/12 Platform</span>
                </div>
              </div>

              {/* Table rows */}
              {comparisons.map((row, index) => (
                <div
                  key={row.aspect}
                  className={`grid grid-cols-3 border-t border-border transition-all duration-500 ${
                    isVisible ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ transitionDelay: `${500 + index * 100}ms` }}
                >
                  <div className="p-4 lg:p-6">
                    <span className="text-sm font-medium">{row.aspect}</span>
                  </div>
                  <div className="p-4 lg:p-6 text-center border-l border-border">
                    <span className="text-sm text-muted-foreground">{row.traditional}</span>
                  </div>
                  <div className="p-4 lg:p-6 text-center border-l border-border bg-secondary/50">
                    <span className="text-sm font-medium text-emerald-600">{row.platform}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
