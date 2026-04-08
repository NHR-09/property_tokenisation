# Software Requirements Specification (SRS)
## 7/12 — Property as Token
### Fractional Real Estate Investment Platform on Solana

**Version:** 1.0  
**Team:** KIRMADA  
**Event:** CRESENDO Hackathon  
**Date:** 2025

---

## 1. Introduction

### 1.1 Purpose
This document specifies the functional and non-functional requirements for **7/12 — Property as Token**, a blockchain-based fractional real estate investment platform. It serves as the reference for design, development, and testing.

### 1.2 Scope
The platform enables:
- Property owners (sellers) to tokenize real estate assets on the Solana blockchain
- Investors to purchase fractional ownership tokens starting from ₹5,000
- Token holders to earn proportional rental income and participate in governance
- Secondary marketplace trading of property tokens

### 1.3 Definitions

| Term | Definition |
|---|---|
| Token | A digital unit representing fractional ownership of a property |
| PDA | Program Derived Address — a deterministic on-chain account on Solana |
| KYC | Know Your Customer — identity verification process |
| eMandate | Electronic mandate for recurring payments |
| Escrow | Platform wallet holding SOL during token transactions |
| IDL | Interface Definition Language — Anchor smart contract ABI |

### 1.4 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS v4, shadcn/ui |
| Backend | Python 3.11+, FastAPI 0.111, Uvicorn |
| Database | Firebase Firestore |
| Blockchain | Solana (localnet), Anchor framework (Rust) |
| Wallet | Phantom browser extension |
| Auth | JWT (python-jose), bcrypt (passlib) |
| Payments | Mock eMandate/UPI simulation |

---

## 2. Overall Description

### 2.1 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│         (localhost:3000 — app/, components/, lib/)       │
└────────────────────────┬────────────────────────────────┘
                         │ REST API (HTTP/JSON)
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  FastAPI Backend                         │
│              (localhost:8000 — /api/v1/*)                │
│   routes/ → services/ → Firebase Firestore              │
│                       → Solana RPC (localhost:8899)      │
└────────────────────────┬────────────────────────────────┘
                         │ Anchor RPC calls
                         ▼
┌─────────────────────────────────────────────────────────┐
│           Solana Test Validator (localhost:8899)         │
│     Program: EHb76xADX6VJGAm1sBXbEAx6bDppvpnvGCKyhaJWMd8N │
│     PDAs: property/[id], ownership/[wallet]/[id]        │
└─────────────────────────────────────────────────────────┘
```

### 2.2 User Roles

| Role | Description |
|---|---|
| Investor | Browses marketplace, buys/sells tokens, views portfolio, votes |
| Seller | Lists properties, monitors funds raised and rental income |
| Admin | Approves/rejects properties, manages KYC, views platform stats |

### 2.3 Assumptions & Constraints
- Solana interactions use a local test validator (not mainnet)
- Payments are simulated (mock eMandate/UPI — no real money)
- KYC is manually approved by admin (no automated verification)
- Phantom wallet is required for crypto payment method
- Firebase Firestore is the single source of truth for off-chain state

---

## 3. Functional Requirements

### 3.1 Authentication (FR-AUTH)

| ID | Requirement |
|---|---|
| FR-AUTH-01 | User shall register with name, email, password, and role (investor/seller/both) |
| FR-AUTH-02 | System shall hash passwords using bcrypt before storing in Firestore |
| FR-AUTH-03 | User shall log in with email and password; system returns a JWT |
| FR-AUTH-04 | JWT shall expire after 10,080 minutes (7 days) |
| FR-AUTH-05 | Protected routes shall validate JWT via Bearer token header |
| FR-AUTH-06 | User shall be able to connect a Phantom wallet via signed message verification |
| FR-AUTH-07 | Wallet address shall be linked to the user's Firestore document |
| FR-AUTH-08 | GET /auth/me shall return user profile including wallet address and KYC status |

### 3.2 Property Management (FR-PROP)

| ID | Requirement |
|---|---|
| FR-PROP-01 | Seller shall submit a property with title, location, city, image URL, valuation, token price, total tokens, seller-retained %, annual yield, type, and description |
| FR-PROP-02 | Submitted properties shall default to `status: pending` and `verified: false` |
| FR-PROP-03 | Available tokens = total_tokens × (1 − seller_retained / 100) |
| FR-PROP-04 | Admin shall update property status: pending → verified → tokenized → listed (or rejected/flagged) |
| FR-PROP-05 | On `tokenized` status, backend shall call `register_property` on Solana smart contract |
| FR-PROP-06 | On `listed` status, property shall be publicly visible in the marketplace |
| FR-PROP-07 | Public marketplace shall filter by city, property_type, and featured flag |
| FR-PROP-08 | System shall seed 6 demo properties via POST /api/v1/seed |
| FR-PROP-09 | Property types supported: Commercial, Office, Residential, Retail, Mixed-Use |

### 3.3 Token Purchase (FR-TOKEN)

| ID | Requirement |
|---|---|
| FR-TOKEN-01 | Investor shall create a payment order specifying property_id and quantity |
| FR-TOKEN-02 | System shall validate sufficient available_tokens before creating order |
| FR-TOKEN-03 | Fiat flow: create order → simulate payment → confirm purchase |
| FR-TOKEN-04 | Crypto flow: provide wallet_address → confirm purchase directly |
| FR-TOKEN-05 | On purchase confirmation, backend shall call `buy_tokens` on Solana smart contract |
| FR-TOKEN-06 | If Solana call fails, system shall fall back to a mock transaction ID (LOCAL_*) |
| FR-TOKEN-07 | Firestore shall update: available_tokens−, sold_tokens+, funds_raised+ |
| FR-TOKEN-08 | Ownership record shall be created or updated in `ownership` collection |
| FR-TOKEN-09 | Transaction shall be logged in `transactions` collection with blockchain_tx reference |
| FR-TOKEN-10 | Platform fee of 1% shall be calculated and recorded on each purchase |
| FR-TOKEN-11 | User's total_invested and properties_owned stats shall be updated |

### 3.4 Token Sale (FR-SELL)

| ID | Requirement |
|---|---|
| FR-SELL-01 | Investor shall sell tokens back to the marketplace pool |
| FR-SELL-02 | System shall validate the investor owns sufficient tokens |
| FR-SELL-03 | Sale amount = token_price × quantity (no fee on sell) |
| FR-SELL-04 | Firestore shall update: available_tokens+, sold_tokens− |
| FR-SELL-05 | Ownership record shall be decremented; deleted if tokens reach 0 |
| FR-SELL-06 | Sell transaction shall be logged with a mock blockchain_tx (SELL_*) |

### 3.5 Portfolio (FR-PORT)

| ID | Requirement |
|---|---|
| FR-PORT-01 | Investor shall view all current token holdings with property details |
| FR-PORT-02 | Each holding shall show: tokens owned, purchase price, current price, rental income, unrealized P&L |
| FR-PORT-03 | Investor shall view full transaction history (buy/sell/rental/dividend) |
| FR-PORT-04 | Portfolio summary shall return: total value, total invested, total unrealized P&L, total rental income, return % |

### 3.6 Governance (FR-GOV)

| ID | Requirement |
|---|---|
| FR-GOV-01 | Token holder shall create a governance proposal for a property they own tokens in |
| FR-GOV-02 | Proposal shall include: title, description, end_date, linked property |
| FR-GOV-03 | Token holder shall cast a vote: for / against / abstain |
| FR-GOV-04 | Voting power = number of tokens owned in the linked property |
| FR-GOV-05 | Each user shall vote only once per proposal |
| FR-GOV-06 | Votes shall be recorded in the proposal's `voters` map in Firestore |
| FR-GOV-07 | Non-token-holders shall be rejected with HTTP 403 |

### 3.7 Payments (FR-PAY)

| ID | Requirement |
|---|---|
| FR-PAY-01 | System shall create a mock payment order with a unique order_id |
| FR-PAY-02 | POST /payments/simulate/{order_id} shall mark the order as `captured` and return a payment_id |
| FR-PAY-03 | payment_id shall be passed to POST /tokens/purchase to confirm the transaction |
| FR-PAY-04 | Order ownership shall be validated (user can only simulate their own order) |

### 3.8 Seller Dashboard (FR-SELL-DASH)

| ID | Requirement |
|---|---|
| FR-SD-01 | Seller shall view all properties they have submitted |
| FR-SD-02 | Each property shall show: status, valuation, total/retained/sold tokens, funds raised, rental income |
| FR-SD-03 | Seller stats shall aggregate: total valuation, total funds raised, total rental income, listed count |

### 3.9 Admin Panel (FR-ADMIN)

| ID | Requirement |
|---|---|
| FR-ADM-01 | Admin shall list all users with KYC status, role, join date, investment stats |
| FR-ADM-02 | Admin shall update a user's KYC status: pending / verified / rejected |
| FR-ADM-03 | Admin shall list all properties with owner, status, valuation, document/legal flags |
| FR-ADM-04 | Admin shall update property status through the approval workflow |
| FR-ADM-05 | Admin stats shall return: total users, pending KYC count, pending properties, flagged items, platform volume |
| FR-ADM-06 | Admin routes shall be protected by role check (role == "admin") |

### 3.10 Blockchain / Solana (FR-CHAIN)

| ID | Requirement |
|---|---|
| FR-BC-01 | Smart contract shall expose `register_property(id, total_tokens, price, yield_bps)` instruction |
| FR-BC-02 | Smart contract shall expose `buy_tokens(property_id, quantity)` instruction |
| FR-BC-03 | Smart contract shall expose `sell_tokens(property_id, quantity)` instruction |
| FR-BC-04 | Property PDA shall be derived from seeds `[b"property", property_id]` |
| FR-BC-05 | Ownership PDA shall be derived from seeds `[b"ownership", buyer_pubkey, property_id]` |
| FR-BC-06 | Backend shall expose GET /blockchain/property-pda/{id} to verify on-chain registration |
| FR-BC-07 | Backend shall expose GET /blockchain/ownership-pda/{wallet}/{id} to verify ownership |
| FR-BC-08 | Backend shall expose POST /blockchain/register-all-properties to batch-register seeded properties |
| FR-BC-09 | SOL balance shall be queryable via GET /wallet/balance/{address} |

### 3.11 Frontend Pages (FR-UI)

| Route | Requirement |
|---|---|
| `/` | Landing page with hero, features, stats, how-it-works, FAQ sections |
| `/auth` | Login and registration forms with role selection |
| `/marketplace` | Filterable property grid with search by city and type |
| `/properties/[id]` | Property detail with token purchase flow (fiat or crypto) |
| `/dashboard` | Investor overview with portfolio stats and recent activity |
| `/portfolio` | Holdings table and transaction history |
| `/governance` | Active proposals list with voting interface |
| `/seller` | Seller dashboard with property list and stats |
| `/seller/onboard` | Multi-step property listing form |
| `/admin` | Admin panel with user/property management tables |

---

## 4. Non-Functional Requirements

### 4.1 Performance
- API responses shall complete within 2 seconds under normal load
- Frontend shall achieve First Contentful Paint < 3 seconds on localhost

### 4.2 Security
- Passwords shall never be stored in plaintext (bcrypt hashing)
- JWT tokens shall be validated on every protected endpoint
- Admin routes shall enforce role-based access control
- CORS shall restrict origins to the configured FRONTEND_URL
- Firebase credentials shall be stored in `.env` (never committed)

### 4.3 Reliability
- Solana service shall gracefully degrade to mock transactions if localnet is unavailable
- All Firestore operations shall be wrapped in error handling
- Backend shall return structured error responses with appropriate HTTP status codes

### 4.4 Usability
- Platform shall support INR (₹) as the display currency
- Minimum investment shall be ₹5,000 (1 token)
- All pages shall be responsive (mobile + desktop)

### 4.5 Maintainability
- Backend routes shall be modular (one file per domain)
- Pydantic schemas shall enforce input/output contracts
- Environment variables shall be documented in `.env.example`

---

## 5. Data Models

### 5.1 Firestore Collections

**users**
```
id, name, email, password_hash, role, kyc_status,
wallet_address, total_invested, properties_owned,
join_date, created_at
```

**properties**
```
id, title, location, city, image, valuation, token_price,
total_tokens, available_tokens, sold_tokens, seller_retained,
annual_yield, property_type, verified, featured, status,
funds_raised, rental_income, documents_complete, legal_cleared,
seller_id, seller_name, submitted_date, created_at
```

**ownership**
```
id, user_id, property_id, property_title, location,
tokens_owned, purchase_price, current_price, purchase_date,
rental_income, unrealized_pl, unrealized_pl_percent
```

**transactions**
```
id, user_id, property_id, property_title, type (buy/sell/rental/dividend),
tokens, amount, platform_fee, payment_method, payment_id,
blockchain_tx, status, date, created_at
```

**proposals**
```
id, property_id, property_title, title, description, status,
votes_for, votes_against, total_votes, end_date, created_date,
created_by, voters: {user_id: "for"/"against"/"abstain"}
```

**payment_orders**
```
id, user_id, property_id, quantity, amount, status, payment_id
```

---

## 6. API Summary

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | None | Register user |
| POST | `/api/v1/auth/login` | None | Login, get JWT |
| GET | `/api/v1/auth/me` | JWT | Get user profile |
| POST | `/api/v1/auth/wallet/connect` | None | Verify wallet signature |
| POST | `/api/v1/auth/wallet/link/{user_id}` | None | Link wallet to account |
| GET | `/api/v1/properties` | None | List marketplace properties |
| GET | `/api/v1/properties/{id}` | None | Property detail |
| POST | `/api/v1/properties` | JWT | Seller submits property |
| PATCH | `/api/v1/properties/{id}/status` | Admin | Update property status |
| POST | `/api/v1/payments/create-order` | JWT | Create payment order |
| POST | `/api/v1/payments/simulate/{id}` | JWT | Simulate payment |
| GET | `/api/v1/payments/order/{id}` | JWT | Get order status |
| POST | `/api/v1/tokens/order` | JWT | Create token purchase order |
| POST | `/api/v1/tokens/purchase` | JWT | Confirm token purchase |
| POST | `/api/v1/tokens/sell` | JWT | Sell tokens |
| GET | `/api/v1/portfolio/holdings` | JWT | User holdings |
| GET | `/api/v1/portfolio/transactions` | JWT | Transaction history |
| GET | `/api/v1/portfolio/summary` | JWT | Portfolio summary stats |
| GET | `/api/v1/governance/proposals` | JWT | List proposals |
| POST | `/api/v1/governance/proposals` | JWT | Create proposal |
| POST | `/api/v1/governance/vote` | JWT | Cast vote |
| GET | `/api/v1/seller/properties` | JWT | Seller's properties |
| GET | `/api/v1/seller/stats` | JWT | Seller dashboard stats |
| GET | `/api/v1/admin/users` | Admin | List all users |
| PATCH | `/api/v1/admin/users/{id}/kyc` | Admin | Update KYC status |
| GET | `/api/v1/admin/properties` | Admin | List all properties |
| PATCH | `/api/v1/admin/properties/{id}/status` | Admin | Update property status |
| GET | `/api/v1/admin/stats` | Admin | Platform stats |
| GET | `/api/v1/wallet/balance/{address}` | None | SOL balance |
| POST | `/api/v1/wallet/link` | JWT | Link wallet |
| GET | `/api/v1/blockchain/property-pda/{id}` | None | Property PDA lookup |
| GET | `/api/v1/blockchain/ownership-pda/{wallet}/{id}` | None | Ownership PDA lookup |
| POST | `/api/v1/blockchain/register-all-properties` | None | Batch register on-chain |
| POST | `/api/v1/seed` | None | Seed demo data |
| DELETE | `/api/v1/seed/cleanup` | None | Clear all properties |

---

## 7. Smart Contract

**Program ID:** `EHb76xADX6VJGAm1sBXbEAx6bDppvpnvGCKyhaJWMd8N`  
**Network:** Solana Localnet (`http://localhost:8899`)  
**Framework:** Anchor (Rust)

### Instructions

| Instruction | Parameters | Description |
|---|---|---|
| `register_property` | property_id, total_tokens, token_price_lamports, annual_yield_bps | Creates property PDA on-chain |
| `buy_tokens` | property_id, quantity | Transfers SOL to escrow, creates ownership PDA |
| `sell_tokens` | property_id, quantity | Returns tokens to available pool |

### PDAs
- Property: `find_program_address([b"property", property_id], program_id)`
- Ownership: `find_program_address([b"ownership", buyer_pubkey, property_id], program_id)`

---

## 8. Environment Configuration

```env
# Firebase
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
FIREBASE_CLIENT_ID=

# JWT
JWT_SECRET=
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080

# Solana
SOLANA_RPC_URL=http://localhost:8899
SOLANA_PROGRAM_ID=EHb76xADX6VJGAm1sBXbEAx6bDppvpnvGCKyhaJWMd8N
PLATFORM_WALLET_KEYPAIR_PATH=C:\solana\id.json

# App
FRONTEND_URL=http://localhost:3000
PLATFORM_FEE_PERCENT=1.0
```

---

## 9. Out of Scope (Hackathon Version)

- Real payment gateway integration (Razorpay keys are present but unused)
- Mainnet/devnet Solana deployment
- Automated KYC verification
- Real rental income distribution engine
- Secondary marketplace order book
- Email notifications
- Mobile app

---

*Built for CRESENDO Hackathon by Team KIRMADA*
