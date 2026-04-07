from fastapi import APIRouter, Depends, HTTPException
from config import db
from services.auth_service import get_current_user
from services.solana_service import get_wallet_balance, verify_wallet_signature
from google.cloud.firestore_v1.base_query import FieldFilter
from models.schemas import WalletConnect

router = APIRouter(prefix="/wallet", tags=["Wallet"])


@router.get("/balance/{wallet_address}")
async def wallet_balance(wallet_address: str, _: dict = Depends(get_current_user)):
    """Returns SOL balance for a given wallet address."""
    return get_wallet_balance(wallet_address)


@router.post("/link")
async def link_wallet(body: WalletConnect, user: dict = Depends(get_current_user)):
    """Link a verified Phantom wallet to the logged-in user account."""
    if not verify_wallet_signature(body.wallet_address, body.message, body.signature):
        raise HTTPException(status_code=400, detail="Invalid wallet signature")

    db.collection("users").document(user["id"]).update({
        "wallet_address": body.wallet_address
    })
    return {"message": "Wallet linked successfully", "wallet_address": body.wallet_address}


@router.get("/holdings/{wallet_address}")
async def wallet_holdings(wallet_address: str, user: dict = Depends(get_current_user)):
    """Returns all property token holdings linked to a wallet address."""
    users = db.collection("users").where(filter=FieldFilter("wallet_address", "==", wallet_address)).get()
    if not users:
        return {"wallet": wallet_address, "holdings": []}

    target_user_id = users[0].id
    ownership_docs = db.collection("ownership").where(filter=FieldFilter("user_id", "==", target_user_id)).stream()

    holdings = []
    for doc in ownership_docs:
        d = doc.to_dict()
        holdings.append({
            "propertyId": d.get("property_id"),
            "propertyTitle": d.get("property_title"),
            "tokensOwned": d.get("tokens_owned"),
            "currentPrice": d.get("current_price"),
        })

    return {"wallet": wallet_address, "holdings": holdings}
