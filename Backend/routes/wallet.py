from fastapi import APIRouter, Depends
from config import db
from services.auth_service import get_current_user
from services.solana_service import get_wallet_balance
from google.cloud.firestore_v1.base_query import FieldFilter

router = APIRouter(prefix="/wallet", tags=["Wallet"])


@router.get("/balance/{wallet_address}")
async def wallet_balance(wallet_address: str, _: dict = Depends(get_current_user)):
    """Returns SOL balance for a given wallet address."""
    return get_wallet_balance(wallet_address)


@router.get("/holdings/{wallet_address}")
async def wallet_holdings(wallet_address: str, user: dict = Depends(get_current_user)):
    """Returns all property token holdings linked to a wallet address."""
    # Find user by wallet address
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
