from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from typing import List, Optional
from config import db
from models.schemas import PropertyCreate, PropertyOut
from services.auth_service import get_current_user, require_admin
from services.solana_service import mint_property_tokens
from google.cloud.firestore_v1.base_query import FieldFilter

router = APIRouter(prefix="/properties", tags=["Properties"])


def _to_property_out(doc_id: str, data: dict) -> PropertyOut:
    return PropertyOut(
        id=doc_id,
        title=data.get("title", ""),
        location=data.get("location", ""),
        city=data.get("city", ""),
        image=data.get("image", ""),
        valuation=data.get("valuation", 0),
        tokenPrice=data.get("token_price", 0),
        availableTokens=data.get("available_tokens", 0),
        totalTokens=data.get("total_tokens", 0),
        sellerRetained=data.get("seller_retained", 0),
        annualYield=data.get("annual_yield", 0),
        propertyType=data.get("property_type", ""),
        verified=data.get("verified", False),
        featured=data.get("featured", False),
        status=data.get("status", "pending"),
    )


@router.get("", response_model=List[PropertyOut])
async def list_properties(
    city: Optional[str] = None,
    property_type: Optional[str] = None,
    featured: Optional[bool] = None,
):
    """Public endpoint — returns all listed/verified properties."""
    from google.cloud.firestore_v1.base_query import FieldFilter
    query = db.collection("properties").where(filter=FieldFilter("status", "in", ["listed", "verified"]))

    docs = query.stream()
    results = []
    for doc in docs:
        data = doc.to_dict()
        if city and data.get("city") != city:
            continue
        if property_type and data.get("property_type") != property_type:
            continue
        if featured is not None and data.get("featured") != featured:
            continue
        results.append(_to_property_out(doc.id, data))
    return results


@router.get("/{property_id}", response_model=PropertyOut)
async def get_property(property_id: str):
    doc = db.collection("properties").document(property_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Property not found")
    return _to_property_out(doc.id, doc.to_dict())


@router.post("", response_model=PropertyOut)
async def create_property(
    body: PropertyCreate,
    user: dict = Depends(get_current_user),
):
    """Seller submits a new property for review."""
    data = {
        "title": body.title,
        "location": body.location,
        "city": body.city,
        "image": body.image,
        "valuation": body.valuation,
        "token_price": body.token_price,
        "total_tokens": body.total_tokens,
        "available_tokens": int(body.total_tokens * (1 - body.seller_retained / 100)),
        "seller_retained": body.seller_retained,
        "annual_yield": body.annual_yield,
        "property_type": body.property_type,
        "description": body.description,
        "seller_id": user["id"],
        "seller_name": user.get("name", ""),
        "status": "pending",          # admin must approve
        "verified": False,
        "featured": False,
        "documents_complete": False,
        "legal_cleared": False,
        "funds_raised": 0,
        "rental_income": 0,
        "sold_tokens": 0,
        "submitted_date": datetime.utcnow().strftime("%Y-%m-%d"),
        "created_at": datetime.utcnow().isoformat(),
    }
    ref = db.collection("properties").add(data)
    return _to_property_out(ref[1].id, data)


@router.patch("/{property_id}/status")
async def update_property_status(
    property_id: str,
    status: str,
    _: dict = Depends(require_admin),
):
    """Admin approves/rejects/tokenizes a property."""
    valid = ["pending", "verified", "rejected", "flagged", "tokenized", "listed"]
    if status not in valid:
        raise HTTPException(status_code=400, detail=f"Status must be one of {valid}")

    updates = {"status": status}

    if status == "verified":
        updates["verified"] = True

    if status == "tokenized":
        # Mint tokens on Solana
        doc = db.collection("properties").document(property_id).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Property not found")
        prop = doc.to_dict()
        mint_result = mint_property_tokens(
            property_id,
            prop["total_tokens"],
            int(prop["token_price"] * 1e9),   # convert to lamports
        )
        updates["mint_tx"] = mint_result["tx_signature"]

    if status == "listed":
        updates["featured"] = True

    db.collection("properties").document(property_id).update(updates)
    return {"property_id": property_id, "status": status}
