from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from config import db
from models.schemas import UserRegister, UserLogin, WalletConnect, TokenResponse
from services.auth_service import hash_password, verify_password, create_token, get_current_user
from services.solana_service import verify_wallet_signature
from google.cloud.firestore_v1.base_query import FieldFilter

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    """Returns current user profile including name and wallet address."""
    return {
        "user_id": user["id"],
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "role": user.get("role", ""),
        "kyc_status": user.get("kyc_status", "pending"),
        "wallet_address": user.get("wallet_address"),
        "total_invested": user.get("total_invested", 0),
        "properties_owned": user.get("properties_owned", 0),
    }


@router.post("/register", response_model=TokenResponse)
async def register(body: UserRegister):
    # Check duplicate email
    existing = db.collection("users").where(filter=FieldFilter("email", "==", body.email)).get()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_data = {
        "name": body.name,
        "email": body.email,
        "password_hash": hash_password(body.password),
        "role": body.role,
        "kyc_status": "pending",
        "wallet_address": None,
        "total_invested": 0,
        "properties_owned": 0,
        "join_date": datetime.utcnow().strftime("%Y-%m-%d"),
        "created_at": datetime.utcnow().isoformat(),
    }
    ref = db.collection("users").add(user_data)
    user_id = ref[1].id

    return TokenResponse(
        access_token=create_token(user_id, body.role),
        user_id=user_id,
        role=body.role,
        kyc_status="pending",
    )


@router.post("/login", response_model=TokenResponse)
async def login(body: UserLogin):
    users = db.collection("users").where(filter=FieldFilter("email", "==", body.email)).get()
    if not users:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user_doc = users[0]
    user = user_doc.to_dict()

    if not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return TokenResponse(
        access_token=create_token(user_doc.id, user["role"]),
        user_id=user_doc.id,
        role=user["role"],
        kyc_status=user["kyc_status"],
    )


@router.post("/wallet/connect")
async def connect_wallet(body: WalletConnect):
    """
    Verify Phantom wallet ownership via signed message.
    Frontend: sign a known message with Phantom, send signature here.
    """
    if not verify_wallet_signature(body.wallet_address, body.message, body.signature):
        raise HTTPException(status_code=400, detail="Invalid wallet signature")

    return {
        "wallet_address": body.wallet_address,
        "verified": True,
        "message": "Wallet verified successfully",
    }


@router.post("/wallet/link/{user_id}")
async def link_wallet(user_id: str, body: WalletConnect):
    """Link a verified Phantom wallet to a user account."""
    if not verify_wallet_signature(body.wallet_address, body.message, body.signature):
        raise HTTPException(status_code=400, detail="Invalid wallet signature")

    db.collection("users").document(user_id).update({
        "wallet_address": body.wallet_address
    })
    return {"message": "Wallet linked successfully", "wallet_address": body.wallet_address}
