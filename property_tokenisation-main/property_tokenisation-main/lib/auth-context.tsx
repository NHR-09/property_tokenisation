"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { api } from "@/lib/api-client"

interface AuthUser {
  user_id: string
  role: string
  kyc_status: string
  access_token: string
  name: string
  wallet_address?: string
}

interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role?: string) => Promise<void>
  logout: () => void
  updateWalletAddress: (address: string) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    const userData = localStorage.getItem("user_data")
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const res = await api.auth.login(email, password)
    // Store token first so /auth/me can be called
    localStorage.setItem("access_token", res.access_token)
    // Fetch full profile to get real name
    let name = email.split("@")[0]
    try {
      const profile = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"}/auth/me`, {
        headers: { Authorization: `Bearer ${res.access_token}` }
      }).then(r => r.json())
      name = profile.name || name
    } catch {}
    const userData: AuthUser = {
      user_id: res.user_id,
      role: res.role,
      kyc_status: res.kyc_status,
      access_token: res.access_token,
      name,
      wallet_address: undefined,
    }
    localStorage.setItem("user_data", JSON.stringify(userData))
    setUser(userData)
  }

  const register = async (name: string, email: string, password: string, role = "investor") => {
    const res = await api.auth.register(name, email, password, role)
    const userData: AuthUser = {
      user_id: res.user_id,
      role: res.role,
      kyc_status: res.kyc_status,
      access_token: res.access_token,
      name,
    }
    localStorage.setItem("access_token", res.access_token)
    localStorage.setItem("user_data", JSON.stringify(userData))
    setUser(userData)
  }

  const updateWalletAddress = (address: string) => {
    if (!user) return
    const updated = { ...user, wallet_address: address }
    localStorage.setItem("user_data", JSON.stringify(updated))
    setUser(updated)
  }

  const logout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("user_data")
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateWalletAddress, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
