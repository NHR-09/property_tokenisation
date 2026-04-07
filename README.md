# 7/12 — Property as Token 🏢

> Fractional real estate investment platform powered by Solana blockchain

A hackathon project that tokenizes real estate properties into tradable digital tokens. Investors can own fractional shares of premium properties starting from ₹5,000, earn rental income, and trade tokens on a secondary marketplace.

---

## 🎯 What It Does

- **Tokenize Properties** — Each property is represented as a Solana smart contract with a fixed token supply
- **Fractional Ownership** — Buy as little as 1 token to own a fraction of a premium property
- **Earn Rental Income** — Token holders receive proportional rental income distributions
- **Trade Tokens** — Buy and sell tokens on the secondary marketplace
- **Governance Voting** — Vote on property decisions based on token holdings
- **Phantom Wallet** — Connect your Solana wallet for crypto purchases and on-chain ownership

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, Tailwind CSS, shadcn/ui |
| Backend | Python FastAPI |
| Database | Firebase Firestore |
| Blockchain | Solana + Anchor (Rust) |
| Wallet | Phantom |
| Payments | Mock eMandate/UPI simulation |

---

## 📁 Project Structure

```
cRESENDO/
├── property_tokenisation-main/    # Next.js Frontend
│   └── property_tokenisation-main/
│       ├── app/                   # Pages (marketplace, dashboard, portfolio...)
│       ├── components/            # UI components
│       ├── lib/
│       │   ├── api-client.ts      # Backend API client
│       │   ├── auth-context.tsx   # Auth state management
│       │   └── wallet-context.tsx # Phantom wallet integration
│       └── .env.local             # NEXT_PUBLIC_API_URL
│
├── Backend/                       # FastAPI Backend
│   ├── main.py                    # App entry point
│   ├── config.py                  # Firebase + env config
│   ├── routes/                    # API endpoints
│   │   ├── auth.py                # Register, login, wallet link
│   │   ├── properties.py          # Property listings
│   │   ├── tokens.py              # Buy/sell tokens
│   │   ├── portfolio.py           # Holdings & transactions
│   │   ├── governance.py          # Proposals & voting
│   │   ├── payments.py            # Mock payment simulation
│   │   ├── seller.py              # Seller dashboard
│   │   ├── admin.py               # Admin panel
│   │   └── wallet.py              # Solana wallet integration
│   ├── services/
│   │   ├── auth_service.py        # JWT + bcrypt
│   │   ├── solana_service.py      # Blockchain interaction
│   │   └── payment_service.py     # Mock payment simulator
│   └── .env.example               # Environment template
│
└── property_token/                # Anchor Smart Contract
    └── programs/property_token/
        └── src/lib.rs             # Rust smart contract
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Rust + Cargo
- Solana CLI
- Anchor CLI
- Phantom browser extension

### 1. Clone & Setup

```bash
git clone https://github.com/NHR-09/property_tokenisation.git
cd property_tokenisation
```

### 2. Firebase Setup
1. Go to https://console.firebase.google.com → Create project
2. Enable **Firestore Database** (test mode)
3. Go to Project Settings → Service Accounts → Generate new private key
4. Copy credentials to `Backend/.env`

### 3. Backend Setup

```bash
cd Backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
copy .env.example .env         # Fill in Firebase credentials
uvicorn main:app --reload --port 8000
```

Seed the database with 6 properties:
```bash
curl -X POST http://localhost:8000/api/v1/seed
```

### 4. Frontend Setup

```bash
cd property_tokenisation-main/property_tokenisation-main
npm install
# .env.local already has NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
npm run dev
```

### 5. Solana Smart Contract

```bash
# Start local validator (keep running)
solana-test-validator

# In another terminal
cd property_token
cargo-build-sbf --manifest-path programs/property_token/Cargo.toml
solana program deploy target/deploy/property_token.so --keypair C:\solana\id.json --url localhost
```

---

## 🔄 System Flow

```
User registers/logs in
    ↓
Connects Phantom wallet (auto-linked to account in Firebase)
    ↓
Browses marketplace (real data from Firebase)
    ↓
Selects property → chooses token quantity
    ↓
Mock payment simulation (eMandate/UPI)
    ↓
Backend confirms → calls Solana service
    ↓
Ownership PDA derived on-chain
    ↓
Firebase ownership record updated
    ↓
Portfolio dashboard shows real holdings
```

---

## 💳 Mock Payment Flow

```
POST /api/v1/payments/create-order   → order_id
POST /api/v1/payments/simulate/{id}  → payment_id
POST /api/v1/tokens/purchase         → blockchain tx + Firebase update
```

---

## 🔗 Smart Contract

**Program ID:** `EHb76xADX6VJGAm1sBXbEAx6bDppvpnvGCKyhaJWMd8N`

**Instructions:**
- `register_property` — Create property token supply on-chain
- `buy_tokens` — Transfer SOL to escrow, record ownership PDA
- `sell_tokens` — Return tokens to available pool

**PDAs:**
- Property: `[b"property", property_id]`
- Ownership: `[b"ownership", wallet_pubkey, property_id]`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register user |
| POST | `/api/v1/auth/login` | Login, get JWT |
| GET | `/api/v1/auth/me` | Get user profile |
| GET | `/api/v1/properties` | List properties |
| GET | `/api/v1/properties/{id}` | Property detail |
| POST | `/api/v1/payments/create-order` | Create payment order |
| POST | `/api/v1/payments/simulate/{id}` | Simulate payment |
| POST | `/api/v1/tokens/purchase` | Buy tokens |
| POST | `/api/v1/tokens/sell` | Sell tokens |
| GET | `/api/v1/portfolio/holdings` | User holdings |
| GET | `/api/v1/portfolio/transactions` | Transaction history |
| GET | `/api/v1/governance/proposals` | List proposals |
| POST | `/api/v1/governance/vote` | Cast vote |
| GET | `/api/v1/wallet/balance/{address}` | SOL balance |
| POST | `/api/v1/wallet/link` | Link Phantom wallet |
| GET | `/api/v1/admin/stats` | Platform stats |

Full interactive docs: **http://localhost:8000/docs**

---

## 🌐 Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/auth` | Login / Register |
| `/marketplace` | Browse tokenized properties |
| `/properties/[id]` | Property details + buy tokens |
| `/dashboard` | Investor dashboard |
| `/portfolio` | Holdings & income history |
| `/governance` | Vote on proposals |
| `/seller` | Seller dashboard |
| `/seller/onboard` | List a new property |
| `/admin` | Admin panel |

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

## 👥 Team KIRMADA

Built for hackathon — **CRESENDO**

---

## 📄 License

Private — All rights reserved
