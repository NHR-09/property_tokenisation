"use client"

import { useEffect, useRef, useState } from "react"
import { Search, FileCheck, Coins, TrendingUp } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "Browse Properties",
    description: "Explore verified commercial and residential properties across major Indian cities with detailed valuations.",
  },
  {
    icon: FileCheck,
    title: "Complete KYC",
    description: "Quick and secure identity verification to ensure compliance with regulatory requirements.",
  },
  {
    icon: Coins,
    title: "Buy Tokens",
    description: "Purchase fractional ownership tokens starting from ₹5,000. Each token represents real equity.",
  },
  {
    icon: TrendingUp,
    title: "Earn Returns",
    description: "Receive proportional rental income and benefit from property appreciation over time.",
  },
]

export function HowItWorksSection() {
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
    <section id="how-it-works" ref={sectionRef} className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p 
            className={`text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            How It Works
          </p>
          <h2 
            className={`text-3xl lg:text-4xl font-semibold tracking-tight text-balance transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Start investing in real estate in four simple steps
          </h2>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className={`relative group transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${200 + index * 100}ms` }}
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-full h-[2px]">
                  <div 
                    className={`h-full bg-border transition-all duration-1000 origin-left ${
                      isVisible ? "scale-x-100" : "scale-x-0"
                    }`}
                    style={{ transitionDelay: `${600 + index * 200}ms` }}
                  />
                </div>
              )}

              <div className="relative z-10">
                {/* Step number */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center transition-all duration-500 group-hover:bg-foreground group-hover:scale-105">
                    <step.icon className="w-8 h-8 text-muted-foreground transition-colors duration-500 group-hover:text-background" />
                  </div>
                  <span className="text-6xl font-semibold text-secondary lg:hidden">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="hidden lg:inline-block text-sm font-medium text-muted-foreground">
                      Step {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
