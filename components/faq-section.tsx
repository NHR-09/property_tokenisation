"use client"

import { useEffect, useRef, useState } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "What is property tokenization?",
    answer: "Property tokenization is the process of converting real estate ownership into digital tokens on a blockchain. Each token represents a fractional share of the property, allowing investors to own portions of high-value real estate with smaller investments.",
  },
  {
    question: "What is the minimum investment amount?",
    answer: "You can start investing with as little as ₹5,000. This allows you to build a diversified real estate portfolio across multiple properties without requiring large capital.",
  },
  {
    question: "How do I receive rental income?",
    answer: "Rental income is distributed proportionally to all token holders on a monthly basis. The income is automatically calculated based on your token holdings and transferred directly to your connected wallet.",
  },
  {
    question: "Can I sell my tokens anytime?",
    answer: "Yes, tokens can be traded on our secondary marketplace at any time. Unlike traditional real estate, there are no lock-in periods, giving you complete liquidity over your investments.",
  },
  {
    question: "How are properties verified?",
    answer: "Every property undergoes comprehensive due diligence including legal title verification, physical inspection, valuation by certified valuers, compliance checks, and structural audits before being listed on the platform.",
  },
  {
    question: "What legal protections do I have?",
    answer: "Each property is held in a Special Purpose Vehicle (SPV). Token holders are registered as beneficial owners with full legal rights. All documentation is maintained on-chain and with relevant authorities for complete transparency.",
  },
]

export function FAQSection() {
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
    <section id="faq" ref={sectionRef} className="py-20 lg:py-28">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p 
            className={`text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            FAQ
          </p>
          <h2 
            className={`text-3xl lg:text-4xl font-semibold tracking-tight text-balance transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Frequently asked questions
          </h2>
        </div>

        {/* Accordion */}
        <div 
          className={`transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border rounded-xl px-6 data-[state=open]:bg-secondary/50 transition-colors duration-300"
              >
                <AccordionTrigger className="text-left py-5 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                  <span className="font-medium pr-4">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact CTA */}
        <div 
          className={`mt-12 text-center transition-all duration-700 delay-400 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <p className="text-muted-foreground">
            Still have questions?{" "}
            <a href="#" className="text-foreground font-medium underline underline-offset-4 hover:text-foreground/80 transition-colors duration-300">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
