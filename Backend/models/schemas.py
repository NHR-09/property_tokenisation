from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Literal
from datetime import datetime


# ── Auth ──────────────────────────────────────────────────────────────────────
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Literal["investor", "seller", "both"] = "investor"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class WalletConnect(BaseModel):
    wallet_address: str
    signature: str          # signed message to prove ownership
    message: str            # the message that was signed

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    role: str
    kyc_status: str


# ── Property ──────────────────────────────────────────────────────────────────
class PropertyCreate(BaseModel):
    title: str
    location: str
    city: str
    image: Optional[str] = ""
    valuation: float
    token_price: float
    total_tokens: int
    seller_retained: float          # percentage
    annual_yield: float
    property_type: Literal["Commercial", "Office", "Residential", "Retail", "Mixed-Use"]
    description: Optional[str] = ""

class PropertyOut(BaseModel):
    id: str
    title: str
    location: str
    city: str
    image: str
    valuation: float
    tokenPrice: float               # camelCase to match frontend
    availableTokens: int
    totalTokens: int
    sellerRetained: float
    annualYield: float
    propertyType: str
    verified: bool
    featured: bool
    status: str


# ── Token Purchase ────────────────────────────────────────────────────────────
class TokenPurchaseRequest(BaseModel):
    property_id: str
    quantity: int
    payment_method: Literal["crypto", "fiat"]
    wallet_address: Optional[str] = None   # required for crypto
    razorpay_payment_id: Optional[str] = None  # required for fiat

class TokenPurchaseOut(BaseModel):
    transaction_id: str
    property_id: str
    tokens: int
    amount_paid: float
    platform_fee: float
    blockchain_tx: Optional[str] = None
    status: str


class TokenSellOut(BaseModel):
    transaction_id: str
    property_id: str
    tokens_sold: int
    amount_received: float
    blockchain_tx: Optional[str] = None
    status: str


# ── Portfolio ─────────────────────────────────────────────────────────────────
class HoldingOut(BaseModel):
    id: str
    propertyId: str
    propertyTitle: str
    propertyType: str = "Commercial"
    location: str
    tokensOwned: int
    purchasePrice: float
    currentPrice: float
    purchaseDate: str
    rentalIncome: float
    unrealizedPL: float
    unrealizedPLPercent: float


# ── Transaction ───────────────────────────────────────────────────────────────
class TransactionOut(BaseModel):
    id: str
    type: Literal["buy", "sell", "rental", "dividend"]
    propertyTitle: str
    amount: float
    tokens: Optional[int] = None
    date: str
    status: Literal["completed", "pending", "failed"]
    blockchainTx: Optional[str] = None


# ── Governance ────────────────────────────────────────────────────────────────
class ProposalCreate(BaseModel):
    property_id: str
    title: str
    description: str
    end_date: str

class VoteCast(BaseModel):
    proposal_id: str
    vote: Literal["for", "against", "abstain"]

class ProposalOut(BaseModel):
    id: str
    propertyId: str
    propertyTitle: str
    title: str
    description: str
    status: str
    votesFor: int
    votesAgainst: int
    totalVotes: int
    endDate: str
    createdDate: str


# ── Seller ────────────────────────────────────────────────────────────────────
class SellerPropertyOut(BaseModel):
    id: str
    title: str
    location: str
    status: str
    valuation: float
    totalTokens: int
    retainedTokens: int
    soldTokens: int
    fundsRaised: float
    rentalIncome: float
    submittedDate: str


# ── Admin ─────────────────────────────────────────────────────────────────────
class AdminUserOut(BaseModel):
    id: str
    name: str
    email: str
    kycStatus: str
    role: str
    joinDate: str
    totalInvested: float
    propertiesOwned: int

class AdminPropertyOut(BaseModel):
    id: str
    title: str
    owner: str
    status: str
    valuation: float
    submittedDate: str
    documentsComplete: bool
    legalCleared: bool

class PropertyStatusUpdate(BaseModel):
    status: Literal["pending_review", "verified", "rejected", "flagged", "tokenized", "listed"]

class KYCStatusUpdate(BaseModel):
    status: Literal["pending", "verified", "rejected"]


# ── Payment ───────────────────────────────────────────────────────────────────
class PaymentOrderCreate(BaseModel):
    property_id: str
    quantity: int               # number of tokens

class PaymentOrderOut(BaseModel):
    order_id: str
    amount: int                 # in paise
    currency: str = "INR"
    key_id: str
    property_id: str
    quantity: int

class WebhookPayload(BaseModel):
    event: str
    payload: dict
