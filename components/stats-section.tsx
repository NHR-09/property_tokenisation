"use client"

import { useEffect, useRef, useState } from "react"

const stats = [
  { value: "₹47", suffix: "Cr+", label: "Total Value Invested" },
  { value: "2,400", suffix: "+", label: "Active Investors" },
  { value: "12", suffix: "", label: "Verified Properties" },
  { value: "12.5", suffix: "%", label: "Avg. Annual Yield" },
]

function AnimatedCounter({ value, suffix, isVisible }: { value: string; suffix: string; isVisible: boolean }) {
  const [displayValue, setDisplayValue] = useState("0")
  
  useEffect(() => {
    if (!isVisible) return
    
    const numericValue = parseFloat(value.replace(/,/g, ''))
    const hasComma = value.includes(',')
    const duration = 2000
    const steps = 60
    const stepTime = duration / steps
    let currentStep = 0
    
    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentValue = numericValue * easeOut
      
      if (hasComma) {
        setDisplayValue(Math.floor(currentValue).toLocaleString('en-IN'))
      } else if (value.includes('.')) {
        setDisplayValue(currentValue.toFixed(1))
      } else {
        setDisplayValue(Math.floor(currentValue).toString())
      }
      
      if (currentStep >= steps) {
        clearInterval(timer)
        setDisplayValue(value)
      }
    }, stepTime)
    
    return () => clearInterval(timer)
  }, [isVisible, value])
  
  return (
    <span className="tabular-nums">
      {displayValue}{suffix}
    </span>
  )
}

export function StatsSection() {
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
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="py-16 lg:py-20 border-y border-border bg-card">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`text-center lg:text-left transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <p className="text-3xl lg:text-4xl font-semibold tracking-tight">
                <AnimatedCounter 
                  value={stat.value} 
                  suffix={stat.suffix} 
                  isVisible={isVisible} 
                />
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
