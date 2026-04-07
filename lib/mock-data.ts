import type { Property } from "@/components/property-card"

export const properties: Property[] = [
  {
    id: "prop-001",
    title: "Premium Commercial Complex",
    location: "Wakad",
    city: "Pune",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=60",
    valuation: 125000000,
    tokenPrice: 5000,
    availableTokens: 15000,
    totalTokens: 25000,
    sellerRetained: 20,
    annualYield: 8.5,
    propertyType: "Commercial",
    verified: true,
    featured: true,
  },
  {
    id: "prop-002",
    title: "Tech Park Office Space",
    location: "Hinjewadi",
    city: "Pune",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=60",
    valuation: 85000000,
    tokenPrice: 2500,
    availableTokens: 20000,
    totalTokens: 34000,
    sellerRetained: 15,
    annualYield: 9.2,
    propertyType: "Office",
    verified: true,
    featured: true,
  },
  {
    id: "prop-003",
    title: "Luxury Residential Tower",
    location: "Whitefield",
    city: "Bangalore",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=60",
    valuation: 200000000,
    tokenPrice: 10000,
    availableTokens: 8000,
    totalTokens: 20000,
    sellerRetained: 25,
    annualYield: 7.8,
    propertyType: "Residential",
    verified: true,
    featured: false,
  },
  {
    id: "prop-004",
    title: "Premium Retail Complex",
    location: "Andheri",
    city: "Mumbai",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=60",
    valuation: 320000000,
    tokenPrice: 15000,
    availableTokens: 12000,
    totalTokens: 21333,
    sellerRetained: 18,
    annualYield: 10.5,
    propertyType: "Retail",
    verified: true,
    featured: true,
  },
  {
    id: "prop-005",
    title: "IT Hub Office Tower",
    location: "Gachibowli",
    city: "Hyderabad",
    image: "https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=800&auto=format&fit=crop&q=60",
    valuation: 150000000,
    tokenPrice: 7500,
    availableTokens: 10000,
    totalTokens: 20000,
    sellerRetained: 22,
    annualYield: 8.9,
    propertyType: "Office",
    verified: true,
    featured: false,
  },
  {
    id: "prop-006",
    title: "Mixed-Use Development",
    location: "Baner",
    city: "Pune",
    image: "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800&auto=format&fit=crop&q=60",
    valuation: 95000000,
    tokenPrice: 4000,
    availableTokens: 18000,
    totalTokens: 23750,
    sellerRetained: 12,
    annualYield: 9.8,
    propertyType: "Mixed-Use",
    verified: false,
    featured: false,
  },
]

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

export const portfolioHoldings: PortfolioHolding[] = [
  {
    id: "hold-001",
    propertyId: "prop-001",
    propertyTitle: "Premium Commercial Complex",
    location: "Wakad, Pune",
    tokensOwned: 500,
    purchasePrice: 4800,
    currentPrice: 5000,
    purchaseDate: "2024-01-15",
    rentalIncome: 8500,
    unrealizedPL: 100000,
    unrealizedPLPercent: 4.17,
  },
  {
    id: "hold-002",
    propertyId: "prop-002",
    propertyTitle: "Tech Park Office Space",
    location: "Hinjewadi, Pune",
    tokensOwned: 800,
    purchasePrice: 2400,
    currentPrice: 2500,
    purchaseDate: "2024-02-20",
    rentalIncome: 6200,
    unrealizedPL: 80000,
    unrealizedPLPercent: 4.17,
  },
  {
    id: "hold-003",
    propertyId: "prop-004",
    propertyTitle: "Premium Retail Complex",
    location: "Andheri, Mumbai",
    tokensOwned: 200,
    purchasePrice: 14500,
    currentPrice: 15000,
    purchaseDate: "2024-03-10",
    rentalIncome: 12500,
    unrealizedPL: 100000,
    unrealizedPLPercent: 3.45,
  },
]

export interface Transaction {
  id: string
  type: "buy" | "sell" | "rental" | "dividend"
  propertyTitle: string
  amount: number
  tokens?: number
  date: string
  status: "completed" | "pending" | "failed"
}

export const transactions: Transaction[] = [
  {
    id: "txn-001",
    type: "buy",
    propertyTitle: "Premium Commercial Complex",
    amount: 250000,
    tokens: 50,
    date: "2024-03-15",
    status: "completed",
  },
  {
    id: "txn-002",
    type: "rental",
    propertyTitle: "Tech Park Office Space",
    amount: 3100,
    date: "2024-03-01",
    status: "completed",
  },
  {
    id: "txn-003",
    type: "buy",
    propertyTitle: "Premium Retail Complex",
    amount: 150000,
    tokens: 10,
    date: "2024-02-28",
    status: "completed",
  },
  {
    id: "txn-004",
    type: "dividend",
    propertyTitle: "Premium Commercial Complex",
    amount: 4250,
    date: "2024-02-15",
    status: "completed",
  },
  {
    id: "txn-005",
    type: "sell",
    propertyTitle: "Luxury Residential Tower",
    amount: 100000,
    tokens: 10,
    date: "2024-02-10",
    status: "completed",
  },
]

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

export const proposals: Proposal[] = [
  {
    id: "gov-001",
    propertyId: "prop-001",
    propertyTitle: "Premium Commercial Complex",
    title: "Approve Major Renovation",
    description: "Proposal to allocate ₹25 Lakhs from rental reserves for lobby and common area renovation to increase property value.",
    status: "active",
    votesFor: 12500,
    votesAgainst: 3200,
    totalVotes: 25000,
    endDate: "2024-04-15",
    createdDate: "2024-03-15",
  },
  {
    id: "gov-002",
    propertyId: "prop-002",
    propertyTitle: "Tech Park Office Space",
    title: "Change Property Manager",
    description: "Vote to switch property management company to reduce operational costs by 15%.",
    status: "active",
    votesFor: 18000,
    votesAgainst: 8000,
    totalVotes: 34000,
    endDate: "2024-04-10",
    createdDate: "2024-03-10",
  },
  {
    id: "gov-003",
    propertyId: "prop-001",
    propertyTitle: "Premium Commercial Complex",
    title: "Increase Rental Rate",
    description: "Proposal to increase monthly rental rate by 8% for new tenants.",
    status: "passed",
    votesFor: 20000,
    votesAgainst: 5000,
    totalVotes: 25000,
    endDate: "2024-02-28",
    createdDate: "2024-02-01",
  },
]

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

export const sellerProperties: SellerProperty[] = [
  {
    id: "seller-prop-001",
    title: "Commercial Plaza",
    location: "Kharadi, Pune",
    status: "listed",
    valuation: 75000000,
    totalTokens: 15000,
    retainedTokens: 3000,
    soldTokens: 8500,
    fundsRaised: 42500000,
    rentalIncome: 125000,
    submittedDate: "2024-01-05",
  },
  {
    id: "seller-prop-002",
    title: "Office Building",
    location: "HITEC City, Hyderabad",
    status: "tokenized",
    valuation: 120000000,
    totalTokens: 24000,
    retainedTokens: 6000,
    soldTokens: 0,
    fundsRaised: 0,
    rentalIncome: 0,
    submittedDate: "2024-02-15",
  },
  {
    id: "seller-prop-003",
    title: "Retail Space",
    location: "Koramangala, Bangalore",
    status: "pending",
    valuation: 0,
    totalTokens: 0,
    retainedTokens: 0,
    soldTokens: 0,
    fundsRaised: 0,
    rentalIncome: 0,
    submittedDate: "2024-03-20",
  },
]

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

export const adminUsers: AdminUser[] = [
  {
    id: "user-001",
    name: "Rahul Sharma",
    email: "rahul@example.com",
    kycStatus: "verified",
    role: "investor",
    joinDate: "2024-01-10",
    totalInvested: 2500000,
    propertiesOwned: 3,
  },
  {
    id: "user-002",
    name: "Priya Patel",
    email: "priya@example.com",
    kycStatus: "pending",
    role: "both",
    joinDate: "2024-03-01",
    totalInvested: 0,
    propertiesOwned: 0,
  },
  {
    id: "user-003",
    name: "Amit Kumar",
    email: "amit@example.com",
    kycStatus: "verified",
    role: "seller",
    joinDate: "2024-02-15",
    totalInvested: 0,
    propertiesOwned: 2,
  },
]

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

export const adminProperties: AdminProperty[] = [
  {
    id: "admin-prop-001",
    title: "Retail Space - Koramangala",
    owner: "Amit Kumar",
    status: "pending_review",
    valuation: 55000000,
    submittedDate: "2024-03-20",
    documentsComplete: true,
    legalCleared: false,
  },
  {
    id: "admin-prop-002",
    title: "Office Complex - Whitefield",
    owner: "Meera Singh",
    status: "pending_review",
    valuation: 180000000,
    submittedDate: "2024-03-18",
    documentsComplete: false,
    legalCleared: false,
  },
  {
    id: "admin-prop-003",
    title: "Warehouse - Bhiwandi",
    owner: "Rajan Mehta",
    status: "flagged",
    valuation: 45000000,
    submittedDate: "2024-03-15",
    documentsComplete: true,
    legalCleared: true,
  },
]
