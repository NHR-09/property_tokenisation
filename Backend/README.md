# Backend — FastAPI + Firebase + Solana

## Setup

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env   # fill in Firebase credentials
uvicorn main:app --reload --port 8000
```

Seed database: `curl -X POST http://localhost:8000/api/v1/seed`

API docs: http://localhost:8000/docs

## Structure

```
Backend/
├── main.py                  # FastAPI app + CORS + routers
├── config.py                # Firebase + env config
├── requirements.txt
├── .env.example
├── models/schemas.py        # Pydantic models
├── routes/
│   ├── auth.py              # register, login, /me, wallet link
│   ├── properties.py        # CRUD + admin status updates
│   ├── tokens.py            # buy/sell tokens
│   ├── portfolio.py         # holdings, transactions, summary
│   ├── governance.py        # proposals, voting
│   ├── payments.py          # mock payment simulation
│   ├── seller.py            # seller dashboard
│   ├── admin.py             # KYC, approvals, stats
│   └── wallet.py            # SOL balance, wallet link
└── services/
    ├── auth_service.py      # JWT + bcrypt
    ├── solana_service.py    # Solana RPC + PDA derivation
    └── payment_service.py   # Mock eMandate/UPI simulator
```

## Smart Contract

**Program ID:** `EHb76xADX6VJGAm1sBXbEAx6bDppvpnvGCKyhaJWMd8N`
**Network:** Localnet (http://localhost:8899)

```bash
# Start local validator
solana-test-validator

# Build & deploy
cd ../property_token
cargo-build-sbf --manifest-path programs/property_token/Cargo.toml
solana program deploy target/deploy/property_token.so --keypair C:\solana\id.json --url localhost
```
