# 7/12 — Property as Token 🏢

> Fractional real estate investment platform powered by Solana blockchain

A hackathon project that tokenizes real estate properties into tradable digital tokens. Investors can own fractional shares of premium properties starting from ₹5,000, earn rental income, and trade tokens on a secondary marketplace.

---

## 🎯 What It Does

- **Tokenize Properties** — Each property is represented as a Solana smart contract with a fixed token supply
- **Fractional Ownership** — Buy as little as 1 token to own a fraction of a premium property
- **Earn Rental Income** — Token holders receive proportional rental income distributions
- **Trade Tokens** — Buy and sell tokens on the secondary marketplace
- **Governance Voting** — Vote on property decisions; voting power = tokens owned
- **Phantom Wallet** — Connect your Solana wallet for crypto purchases and on-chain ownership

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS v4, shadcn/ui |
| Backend | Python 3.11+, FastAPI 0.111, Uvicorn |
| Database | Firebase Firestore |
| Blockchain | Solana (localnet) + Anchor (Rust) |
| Wallet | Phantom browser extension |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| Payments | Mock eMandate/UPI simulation |

---

## 📁 Project Structure

```
cRESENDO/
├── app/                           # Next.js pages (root frontend)
│   ├── admin/page.tsx
│   ├── dashboard/page.tsx
│   ├── governance/page.tsx
│   ├── marketplace/page.tsx
│   ├── portfolio/page.tsx
│   ├── properties/[id]/page.tsx
│   ├── seller/page.tsx
│   ├── seller/onboard/page.tsx
│   ├── layout.tsx
│   └── page.tsx                   # Landing page
├── components/                    # Shared UI components
│   ├── ui/                        # shadcn/ui primitives
│   ├── navbar.tsx
│   ├── hero-section.tsx
│   ├── property-card.tsx
│   └── ...
├── lib/
│   ├── mock-data.ts
│   └── utils.ts
├── package.json                   # Root Next.js app
│
├── Backend/                       # FastAPI Backend
│   ├── main.py                    # App entry + blockchain endpoints + seed
│   ├── config.py                  # Firebase + env config
│   ├── models/schemas.py          # Pydantic request/response models
│   ├── routes/
│   │   ├── auth.py                # Register, login, wallet link
│   │   ├── properties.py          # Property listings + admin status
│   │   ├── tokens.py              # Buy/sell tokens
│   │   ├── portfolio.py           # Holdings, transactions, summary
│   │   ├── governance.py          # Proposals & voting
│   │   ├── payments.py            # Mock payment simulation
│   │   ├── seller.py              # Seller dashboard
│   │   ├── admin.py               # Admin panel
│   │   └── wallet.py              # Solana wallet integration
│   ├── services/
│   │   ├── auth_service.py        # JWT + bcrypt
│   │   ├── solana_service.py      # Anchor RPC + PDA derivation
│   │   └── payment_service.py     # Mock payment simulator
│   ├── property_token_idl.json    # Anchor IDL for smart contract
│   ├── requirements.txt
│   ├── .env                       # Firebase + JWT + Solana secrets
│   └── .env.example
│
├── property_token/                # Anchor Smart Contract (Rust)
│   ├── programs/property_token/
│   │   └── src/lib.rs             # register_property, buy_tokens, sell_tokens
│   ├── target/deploy/
│   │   └── property_token.so      # Compiled program binary
│   ├── Anchor.toml
│   └── Cargo.toml
│
└── property_tokenisation-main/    # Alternate frontend (has Solana wallet adapters)
    └── property_tokenisation-main/
        ├── app/
        ├── lib/
        │   ├── api-client.ts
        │   ├── auth-context.tsx
        │   └── wallet-context.tsx
        └── .env.local             # NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Rust + Cargo
- Solana CLI (`solana-test-validator` in PATH)
- Anchor CLI
- Phantom browser extension

### 1. Clone & Setup

```bash
git clone https://github.com/NHR-09/property_tokenisation.git
cd cRESENDO
```

### 2. Firebase Setup
1. Go to https://console.firebase.google.com → Create project
2. Enable **Firestore Database** (test mode)
3. Project Settings → Service Accounts → Generate new private key
4. Copy credentials into `Backend/.env`

### 3. Start All Three Services

Open **3 separate terminals** and run in this order:

**Terminal 1 — Solana Test Validator** (start first)
```bash
cd property_token
solana-test-validator
```

**Terminal 2 — FastAPI Backend**
```bash
cd Backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Terminal 3 — Next.js Frontend**
```bash
# From project root (cRESENDO/)
npm install
npm run dev
```

### 4. Seed the Database

After the backend is running, seed 6 demo properties:
```bash
curl -X POST http://localhost:8000/api/v1/seed
```

### 5. Register Properties On-Chain (optional)

```bash
curl -X POST http://localhost:8000/api/v1/blockchain/register-all-properties
```

---

## 🌐 Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/auth` | Login / Register |
| `/marketplace` | Browse tokenized properties |
| `/properties/[id]` | Property details + buy tokens |
| `/dashboard` | Investor dashboard |
| `/portfolio` | Holdings & transaction history |
| `/governance` | Vote on proposals |
| `/seller` | Seller dashboard |
| `/seller/onboard` | List a new property |
| `/admin` | Admin panel |

---

## 💳 Payment Flow

```
POST /api/v1/payments/create-order   → order_id
POST /api/v1/payments/simulate/{id}  → payment_id
POST /api/v1/tokens/purchase         → blockchain tx + Firebase update
```

---

## 🔄 System Flow

```
User registers / logs in
    ↓
Connects Phantom wallet (linked to Firebase account)
    ↓
Browses marketplace (live data from Firestore)
    ↓
Selects property → chooses token quantity
    ↓
Mock payment simulation (eMandate/UPI)
    ↓
Backend confirms → calls Solana service (buy_tokens)
    ↓
Ownership PDA derived on-chain (or mock tx if validator down)
    ↓
Firestore ownership record updated
    ↓
Portfolio dashboard shows real holdings
```

---

## 🔗 Smart Contract

**Program ID:** `EHb76xADX6VJGAm1sBXbEAx6bDppvpnvGCKyhaJWMd8N`  
**Network:** Solana Localnet (`http://localhost:8899`)

**Instructions:**
- `register_property` — Create property token supply on-chain
- `buy_tokens` — Transfer SOL to escrow, record ownership PDA
- `sell_tokens` — Return tokens to available pool

**PDAs:**
- Property: `[b"property", property_id]`
- Ownership: `[b"ownership", buyer_pubkey, property_id]`

**Verify on-chain:**
```bash
# Check property PDA
GET http://localhost:8000/api/v1/blockchain/property-pda/{property_id}

# Check ownership PDA
GET http://localhost:8000/api/v1/blockchain/ownership-pda/{wallet}/{property_id}
```

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | — | Register user |
| POST | `/api/v1/auth/login` | — | Login, get JWT |
| GET | `/api/v1/auth/me` | JWT | Get user profile |
| POST | `/api/v1/auth/wallet/connect` | — | Verify wallet signature |
| POST | `/api/v1/auth/wallet/link/{id}` | — | Link Phantom wallet |
| GET | `/api/v1/properties` | — | List properties |
| GET | `/api/v1/properties/{id}` | — | Property detail |
| POST | `/api/v1/properties` | JWT | Submit property (seller) |
| PATCH | `/api/v1/properties/{id}/status` | Admin | Approve/reject property |
| POST | `/api/v1/payments/create-order` | JWT | Create payment order |
| POST | `/api/v1/payments/simulate/{id}` | JWT | Simulate payment |
| POST | `/api/v1/tokens/purchase` | JWT | Buy tokens |
| POST | `/api/v1/tokens/sell` | JWT | Sell tokens |
| GET | `/api/v1/portfolio/holdings` | JWT | User holdings |
| GET | `/api/v1/portfolio/transactions` | JWT | Transaction history |
| GET | `/api/v1/portfolio/summary` | JWT | Portfolio summary |
| GET | `/api/v1/governance/proposals` | JWT | List proposals |
| POST | `/api/v1/governance/proposals` | JWT | Create proposal |
| POST | `/api/v1/governance/vote` | JWT | Cast vote |
| GET | `/api/v1/seller/properties` | JWT | Seller's properties |
| GET | `/api/v1/seller/stats` | JWT | Seller stats |
| GET | `/api/v1/admin/users` | Admin | List all users |
| PATCH | `/api/v1/admin/users/{id}/kyc` | Admin | Update KYC |
| GET | `/api/v1/admin/properties` | Admin | List all properties |
| PATCH | `/api/v1/admin/properties/{id}/status` | Admin | Update property status |
| GET | `/api/v1/admin/stats` | Admin | Platform stats |
| GET | `/api/v1/wallet/balance/{address}` | — | SOL balance |
| GET | `/api/v1/blockchain/property-pda/{id}` | — | Property PDA |
| GET | `/api/v1/blockchain/ownership-pda/{wallet}/{id}` | — | Ownership PDA |
| POST | `/api/v1/blockchain/register-all-properties` | — | Batch register on-chain |
| POST | `/api/v1/seed` | — | Seed 6 demo properties |
| DELETE | `/api/v1/seed/cleanup` | — | Clear all properties |

Full interactive docs: **http://localhost:8000/docs**

---

## 🔐 Environment Variables

```env
# Firebase
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
FIREBASE_CLIENT_ID=

# JWT
JWT_SECRET=your-secret-key
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

## 📄 Documentation

- **SRS** — See [`SRS.md`](./SRS.md) for full Software Requirements Specification
- **API Docs** — http://localhost:8000/docs (Swagger UI, auto-generated)

---

## 👥 Team KIRMADA

Built for hackathon — **CRESENDO**

---

## 📄 License

Private — All rights reserved
