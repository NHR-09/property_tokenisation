import type { Property } from "@/components/property-card"

// Properties now come from Firebase via API — this is intentionally empty
export const properties: Property[] = []

export interface PortfolioHolding {
  id: string
  propertyId: string
  propertyTitle: string
  location: string
  tokensOwned: number
  purchasePrice: number
  currentPrice: number
  purchaseDate: string
  rentalIncome: number
  unrealizedPL: number
  unrealizedPLPercent: number
}

export const portfolioHoldings: PortfolioHolding[] = []

export interface Transaction {
  id: string
  type: "buy" | "sell" | "rental" | "dividend"
  propertyTitle: string
  amount: number
  tokens?: number
  date: string
  status: "completed" | "pending" | "failed"
}

export const transactions: Transaction[] = []

export interface Proposal {
  id: string
  propertyId: string
  propertyTitle: string
  title: string
  description: string
  status: "active" | "passed" | "rejected" | "pending"
  votesFor: number
  votesAgainst: number
  totalVotes: number
  endDate: string
  createdDate: string
}

export const proposals: Proposal[] = []

export interface SellerProperty {
  id: string
  title: string
  location: string
  status: "pending" | "verified" | "tokenized" | "listed" | "rejected"
  valuation: number
  totalTokens: number
  retainedTokens: number
  soldTokens: number
  fundsRaised: number
  rentalIncome: number
  submittedDate: string
}

export const sellerProperties: SellerProperty[] = []

export interface AdminUser {
  id: string
  name: string
  email: string
  kycStatus: "pending" | "verified" | "rejected"
  role: "investor" | "seller" | "both"
  joinDate: string
  totalInvested: number
  propertiesOwned: number
}

export const adminUsers: AdminUser[] = []

export interface AdminProperty {
  id: string
  title: string
  owner: string
  status: "pending_review" | "verified" | "rejected" | "flagged"
  valuation: number
  submittedDate: string
  documentsComplete: boolean
  legalCleared: boolean
}

export const adminProperties: AdminProperty[] = []
