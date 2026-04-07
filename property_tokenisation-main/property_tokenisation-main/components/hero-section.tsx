"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Building2, Wallet } from "lucide-react"

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center pt-20 lg:pt-24 overflow-hidden"
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div className="space-y-8">
            {/* Badge */}
            <div 
              className={`inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm text-muted-foreground">
                Trusted by 2,400+ investors
              </span>
            </div>

            {/* Headline */}
            <h1 
              className={`text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.1] tracking-tight text-balance transition-all duration-700 delay-100 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              Real Estate Investing,{" "}
              <span className="text-muted-foreground">Reimagined</span>
            </h1>

            {/* Subheading */}
            <p 
              className={`text-lg lg:text-xl text-muted-foreground max-w-xl leading-relaxed transition-all duration-700 delay-200 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              Own fractional shares of premium properties. Start with as little as ₹5,000. 
              Transparent, liquid, and fully compliant.
            </p>

            {/* CTAs */}
            <div 
              className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-300 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <Button 
                size="lg" 
                className="group h-12 px-6 text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Building2 className="w-5 h-5 mr-2" />
                Explore Properties
                <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="h-12 px-6 text-base transition-all duration-300 hover:bg-secondary"
              >
                <Wallet className="w-5 h-5 mr-2" />
                Tokenize Property
              </Button>
            </div>

            {/* Trust indicators */}
            <div 
              className={`flex items-center gap-6 pt-4 transition-all duration-700 delay-400 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground"
                  >
                    {String.fromCharCode(65 + i - 1)}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <p className="font-medium">₹47 Cr+ invested</p>
                <p className="text-muted-foreground">across 12 properties</p>
              </div>
            </div>
          </div>

          {/* Right visual */}
          <div 
            className={`relative transition-all duration-1000 delay-300 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            {/* Main card */}
            <div className="relative bg-card border border-border rounded-2xl p-6 shadow-lg hover-lift">
              {/* Property preview */}
              <div className="aspect-[4/3] bg-secondary rounded-xl mb-6 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
                  <Building2 className="w-16 h-16 text-muted-foreground/30" />
                </div>
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-emerald-500/90 text-white text-xs font-medium rounded-full">
                    Verified
                  </span>
                </div>
                <div className="absolute bottom-4 right-4">
                  <span className="px-3 py-1 bg-background/90 backdrop-blur-sm text-foreground text-xs font-medium rounded-full">
                    12.5% APY
                  </span>
                </div>
              </div>

              {/* Property info */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">Wakad Tech Park, Pune</h3>
                  <p className="text-sm text-muted-foreground">Commercial Office Space</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Valuation</p>
                    <p className="font-semibold">₹4.2 Cr</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Token Price</p>
                    <p className="font-semibold">₹5,000</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tokens Sold</span>
                    <span className="font-medium">68%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-foreground rounded-full transition-all duration-1000 ease-out"
                      style={{ width: isVisible ? '68%' : '0%' }}
                    />
                  </div>
                </div>

                <Button className="w-full transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]">
                  Invest Now
                </Button>
              </div>
            </div>

            {/* Floating elements */}
            <div 
              className={`absolute -top-4 -right-4 bg-card border border-border rounded-xl p-4 shadow-lg transition-all duration-700 delay-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <span className="text-emerald-600 text-lg">↗</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Monthly Returns</p>
                  <p className="font-semibold text-emerald-600">+8.4%</p>
                </div>
              </div>
            </div>

            <div 
              className={`absolute -bottom-4 -left-4 bg-card border border-border rounded-xl p-4 shadow-lg transition-all duration-700 delay-600 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Value Locked</p>
                  <p className="font-semibold">₹47.2 Cr</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
