from fastapi import APIRouter, Depends
from typing import List
from config import db
from models.schemas import SellerPropertyOut
from services.auth_service import get_current_user
from google.cloud.firestore_v1.base_query import FieldFilter

router = APIRouter(prefix="/seller", tags=["Seller"])


def _to_seller_property_out(doc_id: str, d: dict) -> SellerPropertyOut:
    return SellerPropertyOut(
        id=doc_id,
        title=d.get("title", ""),
        location=f"{d.get('location', '')}, {d.get('city', '')}",
        status=d.get("status", "pending"),
        valuation=d.get("valuation", 0),
        totalTokens=d.get("total_tokens", 0),
        retainedTokens=int(d.get("total_tokens", 0) * d.get("seller_retained", 0) / 100),
        soldTokens=d.get("sold_tokens", 0),
        fundsRaised=d.get("funds_raised", 0),
        rentalIncome=d.get("rental_income", 0),
        submittedDate=d.get("submitted_date", ""),
    )


@router.get("/properties", response_model=List[SellerPropertyOut])
async def get_seller_properties(user: dict = Depends(get_current_user)):
    """Returns all properties submitted by the logged-in seller."""
    docs = db.collection("properties").where(filter=FieldFilter("seller_id", "==", user["id"])).stream()
    return [_to_seller_property_out(doc.id, doc.to_dict()) for doc in docs]


@router.get("/stats")
async def get_seller_stats(user: dict = Depends(get_current_user)):
    """Aggregated stats for the seller dashboard stat cards."""
    docs = list(db.collection("properties").where(filter=FieldFilter("seller_id", "==", user["id"])).stream())

    total_valuation = sum(d.to_dict().get("valuation", 0) for d in docs)
    total_funds_raised = sum(d.to_dict().get("funds_raised", 0) for d in docs)
    total_rental_income = sum(d.to_dict().get("rental_income", 0) for d in docs)
    listed_count = sum(1 for d in docs if d.to_dict().get("status") == "listed")

    return {
        "totalValuation": total_valuation,
        "totalFundsRaised": total_funds_raised,
        "totalRentalIncome": total_rental_income,
        "listedProperties": listed_count,
    }
