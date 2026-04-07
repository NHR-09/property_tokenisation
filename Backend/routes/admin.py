from fastapi import APIRouter, HTTPException, Depends
from typing import List
from config import db
from models.schemas import AdminUserOut, AdminPropertyOut, PropertyStatusUpdate, KYCStatusUpdate
from services.auth_service import require_admin

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=List[AdminUserOut])
async def list_users(_: dict = Depends(require_admin)):
    docs = db.collection("users").stream()
    users = []
    for doc in docs:
        d = doc.to_dict()
        users.append(AdminUserOut(
            id=doc.id,
            name=d.get("name", ""),
            email=d.get("email", ""),
            kycStatus=d.get("kyc_status", "pending"),
            role=d.get("role", "investor"),
            joinDate=d.get("join_date", ""),
            totalInvested=d.get("total_invested", 0),
            propertiesOwned=d.get("properties_owned", 0),
        ))
    return users


@router.patch("/users/{user_id}/kyc")
async def update_kyc(
    user_id: str,
    body: KYCStatusUpdate,
    _: dict = Depends(require_admin),
):
    doc = db.collection("users").document(user_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
    db.collection("users").document(user_id).update({"kyc_status": body.status})
    return {"user_id": user_id, "kyc_status": body.status}


@router.get("/properties", response_model=List[AdminPropertyOut])
async def list_all_properties(_: dict = Depends(require_admin)):
    docs = db.collection("properties").stream()
    props = []
    for doc in docs:
        d = doc.to_dict()
        props.append(AdminPropertyOut(
            id=doc.id,
            title=d.get("title", ""),
            owner=d.get("seller_name", ""),
            status=d.get("status", "pending_review"),
            valuation=d.get("valuation", 0),
            submittedDate=d.get("submitted_date", ""),
            documentsComplete=d.get("documents_complete", False),
            legalCleared=d.get("legal_cleared", False),
        ))
    return props


@router.patch("/properties/{property_id}/status")
async def update_property_status(
    property_id: str,
    body: PropertyStatusUpdate,
    _: dict = Depends(require_admin),
):
    doc = db.collection("properties").document(property_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Property not found")

    updates = {"status": body.status}
    if body.status == "verified":
        updates["verified"] = True
    if body.status == "listed":
        updates["verified"] = True
        updates["featured"] = True

    db.collection("properties").document(property_id).update(updates)
    return {"property_id": property_id, "status": body.status}


@router.get("/stats")
async def get_platform_stats(_: dict = Depends(require_admin)):
    """Stats for the admin dashboard stat cards."""
    users = list(db.collection("users").stream())
    properties = list(db.collection("properties").stream())
    transactions = list(db.collection("transactions").stream())

    pending_kyc = sum(1 for u in users if u.to_dict().get("kyc_status") == "pending")
    pending_props = sum(1 for p in properties if p.to_dict().get("status") == "pending")
    flagged_props = sum(1 for p in properties if p.to_dict().get("status") == "flagged")
    total_volume = sum(t.to_dict().get("amount", 0) for t in transactions)

    return {
        "totalUsers": len(users),
        "pendingKYC": pending_kyc,
        "pendingProperties": pending_props,
        "flaggedItems": flagged_props,
        "platformVolume": total_volume,
    }
