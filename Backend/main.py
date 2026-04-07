from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import FRONTEND_URL

from routes.auth import router as auth_router
from routes.properties import router as properties_router
from routes.tokens import router as tokens_router
from routes.portfolio import router as portfolio_router
from routes.governance import router as governance_router
from routes.seller import router as seller_router
from routes.admin import router as admin_router
from routes.payments import router as payments_router
from routes.wallet import router as wallet_router

app = FastAPI(
    title="Property as Stock — API",
    description="Backend for fractional real estate tokenization platform",
    version="1.0.0",
)

# ── CORS — allow Next.js frontend ─────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth_router,       prefix="/api/v1")
app.include_router(properties_router, prefix="/api/v1")
app.include_router(tokens_router,     prefix="/api/v1")
app.include_router(portfolio_router,  prefix="/api/v1")
app.include_router(governance_router, prefix="/api/v1")
app.include_router(seller_router,     prefix="/api/v1")
app.include_router(admin_router,      prefix="/api/v1")
app.include_router(payments_router,   prefix="/api/v1")
app.include_router(wallet_router,     prefix="/api/v1")


@app.get("/")
def root():
    return {"status": "ok", "message": "Property as Stock API is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}


# ── Seed endpoint (hackathon only — remove in production) ─────────────────────
@app.post("/api/v1/seed", tags=["Dev"])
def seed_mock_data():
    """
    Seeds Firebase with the same mock data the frontend uses.
    Call once after setting up Firebase to populate the DB.
    """
    from config import db
    from datetime import datetime

    properties = [
        {
            "title": "Premium Commercial Complex", "location": "Wakad", "city": "Pune",
            "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=60",
            "valuation": 125000000, "token_price": 5000, "total_tokens": 25000,
            "available_tokens": 15000, "sold_tokens": 10000, "seller_retained": 20,
            "annual_yield": 8.5, "property_type": "Commercial", "verified": True,
            "featured": True, "status": "listed", "funds_raised": 50000000,
            "rental_income": 125000, "documents_complete": True, "legal_cleared": True,
            "seller_id": "seed_seller", "seller_name": "Demo Seller",
            "submitted_date": "2024-01-05", "created_at": datetime.utcnow().isoformat(),
        },
        {
            "title": "Tech Park Office Space", "location": "Hinjewadi", "city": "Pune",
            "image": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=60",
            "valuation": 85000000, "token_price": 2500, "total_tokens": 34000,
            "available_tokens": 20000, "sold_tokens": 14000, "seller_retained": 15,
            "annual_yield": 9.2, "property_type": "Office", "verified": True,
            "featured": True, "status": "listed", "funds_raised": 35000000,
            "rental_income": 95000, "documents_complete": True, "legal_cleared": True,
            "seller_id": "seed_seller", "seller_name": "Demo Seller",
            "submitted_date": "2024-01-10", "created_at": datetime.utcnow().isoformat(),
        },
        {
            "title": "Luxury Residential Tower", "location": "Whitefield", "city": "Bangalore",
            "image": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=60",
            "valuation": 200000000, "token_price": 10000, "total_tokens": 20000,
            "available_tokens": 8000, "sold_tokens": 12000, "seller_retained": 25,
            "annual_yield": 7.8, "property_type": "Residential", "verified": True,
            "featured": False, "status": "listed", "funds_raised": 120000000,
            "rental_income": 200000, "documents_complete": True, "legal_cleared": True,
            "seller_id": "seed_seller", "seller_name": "Demo Seller",
            "submitted_date": "2024-01-15", "created_at": datetime.utcnow().isoformat(),
        },
        {
            "title": "Premium Retail Complex", "location": "Andheri", "city": "Mumbai",
            "image": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=60",
            "valuation": 320000000, "token_price": 15000, "total_tokens": 21333,
            "available_tokens": 12000, "sold_tokens": 9333, "seller_retained": 18,
            "annual_yield": 10.5, "property_type": "Retail", "verified": True,
            "featured": True, "status": "listed", "funds_raised": 140000000,
            "rental_income": 350000, "documents_complete": True, "legal_cleared": True,
            "seller_id": "seed_seller", "seller_name": "Demo Seller",
            "submitted_date": "2024-01-20", "created_at": datetime.utcnow().isoformat(),
        },
        {
            "title": "IT Hub Office Tower", "location": "Gachibowli", "city": "Hyderabad",
            "image": "https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=800&auto=format&fit=crop&q=60",
            "valuation": 150000000, "token_price": 7500, "total_tokens": 20000,
            "available_tokens": 10000, "sold_tokens": 10000, "seller_retained": 22,
            "annual_yield": 8.9, "property_type": "Office", "verified": True,
            "featured": False, "status": "listed", "funds_raised": 75000000,
            "rental_income": 160000, "documents_complete": True, "legal_cleared": True,
            "seller_id": "seed_seller", "seller_name": "Demo Seller",
            "submitted_date": "2024-01-25", "created_at": datetime.utcnow().isoformat(),
        },
        {
            "title": "Mixed-Use Development", "location": "Baner", "city": "Pune",
            "image": "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800&auto=format&fit=crop&q=60",
            "valuation": 95000000, "token_price": 4000, "total_tokens": 23750,
            "available_tokens": 18000, "sold_tokens": 5750, "seller_retained": 12,
            "annual_yield": 9.8, "property_type": "Mixed-Use", "verified": False,
            "featured": False, "status": "listed", "funds_raised": 23000000,
            "rental_income": 80000, "documents_complete": False, "legal_cleared": False,
            "seller_id": "seed_seller", "seller_name": "Demo Seller",
            "submitted_date": "2024-02-01", "created_at": datetime.utcnow().isoformat(),
        },
    ]

    seeded_ids = []
    for prop in properties:
        ref = db.collection("properties").add(prop)
        seeded_ids.append(ref[1].id)

    return {"message": f"Seeded {len(seeded_ids)} properties", "ids": seeded_ids}


@app.delete("/api/v1/seed/cleanup", tags=["Dev"])
def cleanup_duplicate_properties():
    """Deletes all properties and re-seeds with exactly 6 unique ones."""
    from config import db
    # Delete all existing properties
    docs = db.collection("properties").stream()
    deleted = 0
    for doc in docs:
        doc.reference.delete()
        deleted += 1
    return {"message": f"Deleted {deleted} properties. Now call POST /api/v1/seed to re-seed."}
