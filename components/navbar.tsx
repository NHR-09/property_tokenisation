"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 transition-opacity duration-300 hover:opacity-80"
          >
            <div className="w-8 h-8 bg-foreground rounded-sm flex items-center justify-center">
              <span className="text-background font-bold text-sm">7/12</span>
            </div>
            <span className="font-semibold text-foreground hidden sm:inline-block">
              Property as Token
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <Link 
              href="#how-it-works" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              How It Works
            </Link>
            <Link 
              href="#features" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              Features
            </Link>
            <Link 
              href="#why-us" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              Why Us
            </Link>
            <Link 
              href="#faq" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              FAQ
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Button 
              variant="ghost" 
              className="text-sm transition-all duration-300 hover:bg-secondary"
            >
              Connect Wallet
            </Button>
            <Button 
              className="text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 -mr-2 transition-transform duration-300 active:scale-95"
            aria-label="Toggle menu"
          >
            <div className="relative w-6 h-6">
              <Menu 
                className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${
                  isMobileMenuOpen ? "opacity-0 rotate-90" : "opacity-100 rotate-0"
                }`} 
              />
              <X 
                className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${
                  isMobileMenuOpen ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"
                }`} 
              />
            </div>
          </button>
        </nav>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-500 ease-out ${
            isMobileMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="py-4 space-y-1 border-t border-border">
            <Link 
              href="#how-it-works" 
              className="block py-3 text-muted-foreground hover:text-foreground transition-colors duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link 
              href="#features" 
              className="block py-3 text-muted-foreground hover:text-foreground transition-colors duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              href="#why-us" 
              className="block py-3 text-muted-foreground hover:text-foreground transition-colors duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Why Us
            </Link>
            <Link 
              href="#faq" 
              className="block py-3 text-muted-foreground hover:text-foreground transition-colors duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              FAQ
            </Link>
            <div className="flex flex-col gap-2 pt-4">
              <Button variant="outline" className="w-full">
                Connect Wallet
              </Button>
              <Button className="w-full">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
