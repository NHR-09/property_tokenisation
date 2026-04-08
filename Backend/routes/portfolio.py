from fastapi import APIRouter, Depends, HTTPException
from typing import List
from config import db
from models.schemas import HoldingOut, TransactionOut
from services.auth_service import get_current_user
from google.cloud.firestore_v1.base_query import FieldFilter

router = APIRouter(prefix="/portfolio", tags=["Portfolio"])


@router.get("/holdings", response_model=List[HoldingOut])
async def get_holdings(user: dict = Depends(get_current_user)):
    docs = db.collection("ownership").where(filter=FieldFilter("user_id", "==", user["id"])).stream()
    holdings = []
    for doc in docs:
        d = doc.to_dict()
        holdings.append(HoldingOut(
            id=doc.id,
            propertyId=d.get("property_id", ""),
            propertyTitle=d.get("property_title", ""),
            propertyType=d.get("property_type", "Commercial"),
            location=d.get("location", ""),
            tokensOwned=d.get("tokens_owned", 0),
            purchasePrice=d.get("purchase_price", 0),
            currentPrice=d.get("current_price", 0),
            purchaseDate=d.get("purchase_date", ""),
            rentalIncome=d.get("rental_income", 0),
            unrealizedPL=d.get("unrealized_pl", 0),
            unrealizedPLPercent=d.get("unrealized_pl_percent", 0),
        ))
    return holdings


@router.get("/transactions", response_model=List[TransactionOut])
async def get_transactions(user: dict = Depends(get_current_user)):
    try:
        docs = db.collection("transactions").where(filter=FieldFilter("user_id", "==", user["id"])).stream()
        txns = []
        for doc in docs:
            d = doc.to_dict()
            txns.append(TransactionOut(
                id=doc.id,
                type=d.get("type", "buy"),
                propertyTitle=d.get("property_title", ""),
                amount=d.get("amount", 0),
                tokens=d.get("tokens"),
                date=d.get("date", ""),
                status=d.get("status", "completed"),
                blockchainTx=d.get("blockchain_tx"),
            ))
        return txns
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/summary")
async def get_portfolio_summary(user: dict = Depends(get_current_user)):
    holdings_docs = db.collection("ownership").where(filter=FieldFilter("user_id", "==", user["id"])).stream()
    total_value = total_invested = total_unrealized_pl = total_rental_income = 0
    for doc in holdings_docs:
        d = doc.to_dict()
        total_value += d.get("tokens_owned", 0) * d.get("current_price", 0)
        total_invested += d.get("tokens_owned", 0) * d.get("purchase_price", 0)
        total_unrealized_pl += d.get("unrealized_pl", 0)
        total_rental_income += d.get("rental_income", 0)
    return {
        "totalPortfolioValue": total_value,
        "totalInvested": total_invested,
        "totalUnrealizedPL": total_unrealized_pl,
        "totalRentalIncome": total_rental_income,
        "returnPercent": round((total_unrealized_pl / total_invested * 100), 2) if total_invested else 0,
    }
