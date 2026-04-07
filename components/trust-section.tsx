"use client"

import { useEffect, useRef, useState } from "react"
import { Shield, Scale, Lock, Award } from "lucide-react"

const trustItems = [
  {
    icon: Shield,
    title: "SEBI Compliance",
    description: "Operating under regulatory guidelines for investor protection",
  },
  {
    icon: Scale,
    title: "Legal Structure",
    description: "Each property held in a dedicated SPV with proper documentation",
  },
  {
    icon: Lock,
    title: "Secure Infrastructure",
    description: "Enterprise-grade security with multi-signature wallets",
  },
  {
    icon: Award,
    title: "Third-Party Audits",
    description: "Regular audits by reputed CA firms and property valuers",
  },
]

export function TrustSection() {
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
    <section ref={sectionRef} className="py-20 lg:py-28 bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p 
            className={`text-sm font-medium text-background/60 uppercase tracking-wider mb-4 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Trust & Security
          </p>
          <h2 
            className={`text-3xl lg:text-4xl font-semibold tracking-tight text-balance transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Built on transparency and regulatory compliance
          </h2>
        </div>

        {/* Trust grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {trustItems.map((item, index) => (
            <div
              key={item.title}
              className={`p-6 lg:p-8 rounded-2xl border border-background/10 bg-background/5 backdrop-blur-sm transition-all duration-700 hover:bg-background/10 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${200 + index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-background/10 flex items-center justify-center mb-6">
                <item.icon className="w-6 h-6 text-background/80" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-background/60 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Bottom badge */}
        <div 
          className={`mt-16 flex justify-center transition-all duration-700 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full border border-background/20 bg-background/5">
            <div className="flex -space-x-1">
              {['SEBI', 'ISO', 'SOC2'].map((cert) => (
                <div
                  key={cert}
                  className="w-8 h-8 rounded-full bg-background/20 flex items-center justify-center text-xs font-medium"
                >
                  {cert.charAt(0)}
                </div>
              ))}
            </div>
            <span className="text-sm text-background/80">
              Compliant with Indian regulatory standards
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
