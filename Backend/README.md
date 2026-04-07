# Property as Stock — Backend

FastAPI + Firebase + Solana (devnet) backend for the property tokenization platform.

---

## Folder Structure

```
Backend/
├── main.py                  # FastAPI app, CORS, all routers
├── config.py                # Firebase init, env vars
├── requirements.txt
├── .env.example             # copy to .env and fill in
├── models/
│   └── schemas.py           # Pydantic models (match frontend shapes)
├── routes/
│   ├── auth.py              # register, login, wallet connect
│   ├── properties.py        # list, get, create properties
│   ├── tokens.py            # buy tokens, sell tokens
│   ├── portfolio.py         # holdings, transactions, summary
│   ├── governance.py        # proposals, voting
│   ├── seller.py            # seller dashboard data
│   ├── admin.py             # KYC, property approval, stats
│   ├── payments.py          # mock payment simulation
│   └── wallet.py            # SOL balance, wallet holdings
├── services/
│   ├── auth_service.py      # JWT, password hashing, guards
│   ├── solana_service.py    # Solana RPC, mint, transfer (mock-safe)
│   └── payment_service.py   # Mock payment simulator
└── programs/
    └── property_token.rs    # Anchor smart contract skeleton
```

---

## Step 1 — Firebase Setup

1. Go to https://console.firebase.google.com → Create project
2. Go to **Project Settings → Service Accounts → Generate new private key**
3. Copy the values into your `.env` file (see `.env.example`)
4. Enable **Firestore Database** in the Firebase console (start in test mode)

---

## Step 2 — Environment Setup

```bash
cd Backend
copy .env.example .env
# Fill in your Firebase credentials in .env
```

---

## Step 3 — Install & Run

```bash
# Create virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

---

## Step 4 — Seed Mock Data

After the server is running, call this once to populate Firebase with the
same 6 properties shown in the frontend:

```bash
curl -X POST http://localhost:8000/api/v1/seed
```

---

## Step 5 — Connect Frontend

In your Next.js frontend, set the API base URL.
Create `property_tokenisation-main/lib/api.ts`:

```ts
export const API_BASE = "http://localhost:8000/api/v1"
```

Then replace `mock-data` imports with real API calls (see api-client.ts).

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/register | Register user |
| POST | /api/v1/auth/login | Login, get JWT |
| POST | /api/v1/auth/wallet/connect | Verify Phantom wallet |
| POST | /api/v1/auth/wallet/link/{user_id} | Link wallet to account |
| GET  | /api/v1/properties | List all properties |
| GET  | /api/v1/properties/{id} | Property detail |
| POST | /api/v1/properties | Seller submits property |
| POST | /api/v1/payments/create-order | Create mock payment order |
| POST | /api/v1/payments/simulate/{order_id} | Simulate payment success |
| POST | /api/v1/tokens/purchase | Confirm token purchase |
| POST | /api/v1/tokens/sell | Sell tokens |
| GET  | /api/v1/portfolio/holdings | User's token holdings |
| GET  | /api/v1/portfolio/transactions | Transaction history |
| GET  | /api/v1/portfolio/summary | Dashboard stat cards |
| GET  | /api/v1/governance/proposals | List proposals |
| POST | /api/v1/governance/proposals | Create proposal |
| POST | /api/v1/governance/vote | Cast vote |
| GET  | /api/v1/seller/properties | Seller's properties |
| GET  | /api/v1/seller/stats | Seller dashboard stats |
| GET  | /api/v1/admin/users | All users (admin) |
| PATCH| /api/v1/admin/users/{id}/kyc | Update KYC status |
| GET  | /api/v1/admin/properties | All properties (admin) |
| PATCH| /api/v1/admin/properties/{id}/status | Approve/reject property |
| GET  | /api/v1/admin/stats | Platform stats |
| GET  | /api/v1/wallet/balance/{address} | SOL balance |

---

## Mock Payment Flow (Fiat Simulation)

```
1. POST /api/v1/payments/create-order   → get order_id
2. POST /api/v1/payments/simulate/{order_id}  → get payment_id
3. POST /api/v1/tokens/purchase  { payment_method: "fiat", razorpay_payment_id: payment_id }
```

---

## Smart Contract (Anchor)

The contract skeleton is in `programs/property_token.rs`.
To deploy on Solana devnet:

```bash
# Install Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor anchor-cli

# Build
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Copy the program ID into .env → SOLANA_PROGRAM_ID
```
