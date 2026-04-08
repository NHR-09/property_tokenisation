/**
 * api-client.ts
 * Drop-in replacement for mock-data.ts — fetches real data from FastAPI backend.
 * Usage: import { api } from "@/lib/api-client"
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("access_token")
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (!res.ok) {
    let errMsg = res.statusText
    try {
      const err = await res.json()
      errMsg = err.detail ?? errMsg
    } catch {}
    console.error(`API Error ${res.status} on ${path}:`, errMsg)
    throw new Error(errMsg)
  }
  return res.json()
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const auth = {
  register: (name: string, email: string, password: string, role = "investor") =>
    request<{ access_token: string; user_id: string; role: string; kyc_status: string }>(
      "/auth/register", { method: "POST", body: JSON.stringify({ name, email, password, role }) }
    ),

  login: (email: string, password: string) =>
    request<{ access_token: string; user_id: string; role: string; kyc_status: string }>(
      "/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }
    ),

  connectWallet: (wallet_address: string, signature: string, message: string) =>
    request("/auth/wallet/connect", {
      method: "POST",
      body: JSON.stringify({ wallet_address, signature, message }),
    }),

  linkWallet: (user_id: string, wallet_address: string, signature: string, message: string) =>
    request(`/wallet/link`, {
      method: "POST",
      body: JSON.stringify({ wallet_address, signature, message }),
    }),
}

// ── Properties ────────────────────────────────────────────────────────────────
export const properties = {
  list: (params?: { city?: string; property_type?: string; featured?: boolean }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString()
    return request<Property[]>(`/properties${qs ? `?${qs}` : ""}`)
  },
  get: (id: string) => request<Property>(`/properties/${id}`),
  create: (data: PropertyCreatePayload) =>
    request<Property>("/properties", { method: "POST", body: JSON.stringify(data) }),
}

// ── Payments (mock simulation) ────────────────────────────────────────────────
export const payments = {
  createOrder: (property_id: string, quantity: number) =>
    request<PaymentOrder>("/payments/create-order", {
      method: "POST",
      body: JSON.stringify({ property_id, quantity }),
    }),

  simulate: (order_id: string) =>
    request<{ payment_id: string; status: string }>(`/payments/simulate/${order_id}`, {
      method: "POST",
    }),
}

// ── Tokens ────────────────────────────────────────────────────────────────────
export const tokens = {
  purchase: (payload: TokenPurchasePayload) =>
    request<TokenPurchaseResult>("/tokens/purchase", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  sell: (property_id: string, quantity: number) =>
    request<TokenSellResult>(`/tokens/sell?property_id=${property_id}&quantity=${quantity}`, { method: "POST" }),
}

// ── Portfolio ─────────────────────────────────────────────────────────────────
export const portfolio = {
  holdings: () => request<Holding[]>("/portfolio/holdings"),
  transactions: () => request<Transaction[]>("/portfolio/transactions"),
  summary: () => request<PortfolioSummary>("/portfolio/summary"),
}

// ── Governance ────────────────────────────────────────────────────────────────
export const governance = {
  proposals: () => request<Proposal[]>("/governance/proposals"),
  createProposal: (data: { property_id: string; title: string; description: string; end_date: string }) =>
    request<Proposal>("/governance/proposals", { method: "POST", body: JSON.stringify(data) }),
  vote: (proposal_id: string, vote: "for" | "against" | "abstain") =>
    request("/governance/vote", { method: "POST", body: JSON.stringify({ proposal_id, vote }) }),
}

// ── Seller ────────────────────────────────────────────────────────────────────
export const seller = {
  properties: () => request<SellerProperty[]>("/seller/properties"),
  stats: () => request<SellerStats>("/seller/stats"),
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export const admin = {
  users: () => request<AdminUser[]>("/admin/users"),
  updateKYC: (user_id: string, status: string) =>
    request(`/admin/users/${user_id}/kyc`, { method: "PATCH", body: JSON.stringify({ status }) }),
  properties: () => request<AdminProperty[]>("/admin/properties"),
  updatePropertyStatus: (property_id: string, status: string) =>
    request(`/admin/properties/${property_id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  stats: () => request<AdminStats>("/admin/stats"),
}

// ── Wallet ────────────────────────────────────────────────────────────────────
export const wallet = {
  balance: (address: string) => request<{ wallet: string; sol_balance: number }>(`/wallet/balance/${address}`),
  holdings: (address: string) => request(`/wallet/holdings/${address}`),
  verifyTx: (signature: string) => request<{ confirmed: boolean; slot?: number; explorer_url: string; mock?: boolean }>(`/wallet/verify-tx/${signature}`),
}

/** Returns Solana Explorer URL for a tx signature based on the current network */
export function getExplorerUrl(signature: string): string {
  const rpc = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? ""
  let cluster: string
  if (rpc.includes("devnet")) cluster = "devnet"
  else if (rpc.includes("mainnet")) cluster = "mainnet-beta"
  else cluster = "custom&customUrl=http%3A%2F%2Flocalhost%3A8899"
  return `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`
}

export const api = { auth, properties, payments, tokens, portfolio, governance, seller, admin, wallet }

// ── Types (mirror backend schemas) ───────────────────────────────────────────
export interface Property {
  id: string; title: string; location: string; city: string; image: string
  valuation: number; tokenPrice: number; availableTokens: number; totalTokens: number
  sellerRetained: number; annualYield: number; propertyType: string
  verified: boolean; featured: boolean; status: string
}

export interface PropertyCreatePayload {
  title: string; location: string; city: string; image?: string
  valuation: number; token_price: number; total_tokens: number
  seller_retained: number; annual_yield: number; property_type: string; description?: string
}

export interface PaymentOrder {
  order_id: string; amount: number; currency: string; key_id: string
  property_id: string; quantity: number
}

export interface TokenPurchasePayload {
  property_id: string; quantity: number
  payment_method: "fiat" | "crypto"
  wallet_address?: string
  razorpay_payment_id?: string
}

export interface TokenPurchaseResult {
  transaction_id: string; property_id: string; tokens: number
  amount_paid: number; platform_fee: number; blockchain_tx?: string; status: string
}

export interface TokenSellResult {
  transaction_id: string
  property_id: string
  tokens_sold: number
  amount_received: number
  blockchain_tx?: string
  status: string
}

export interface Holding {
  id: string; propertyId: string; propertyTitle: string; propertyType: string; location: string
  tokensOwned: number; purchasePrice: number; currentPrice: number
  purchaseDate: string; rentalIncome: number; unrealizedPL: number; unrealizedPLPercent: number
}

export interface Transaction {
  id: string; type: "buy" | "sell" | "rental" | "dividend"
  propertyTitle: string; amount: number; tokens?: number; date: string
  status: "completed" | "pending" | "failed"; blockchainTx?: string
}

export interface PortfolioSummary {
  totalPortfolioValue: number; totalInvested: number
  totalUnrealizedPL: number; totalRentalIncome: number; returnPercent: number
}

export interface Proposal {
  id: string; propertyId: string; propertyTitle: string; title: string
  description: string; status: string; votesFor: number; votesAgainst: number
  totalVotes: number; endDate: string; createdDate: string
}

export interface SellerProperty {
  id: string; title: string; location: string; status: string
  valuation: number; totalTokens: number; retainedTokens: number
  soldTokens: number; fundsRaised: number; rentalIncome: number; submittedDate: string
}

export interface SellerStats {
  totalValuation: number; totalFundsRaised: number
  totalRentalIncome: number; listedProperties: number
}

export interface AdminUser {
  id: string; name: string; email: string; kycStatus: string
  role: string; joinDate: string; totalInvested: number; propertiesOwned: number
}

export interface AdminProperty {
  id: string; title: string; owner: string; status: string
  valuation: number; submittedDate: string; documentsComplete: boolean; legalCleared: boolean
}

export interface AdminStats {
  totalUsers: number; pendingKYC: number; pendingProperties: number
  flaggedItems: number; platformVolume: number
}
