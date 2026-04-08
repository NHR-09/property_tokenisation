from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
import uuid
from config import db
from models.schemas import TokenPurchaseRequest, TokenPurchaseOut, PaymentOrderCreate, PaymentOrderOut, TokenSellOut
from services.auth_service import get_current_user
from services.payment_service import create_mock_order, simulate_payment, verify_mock_payment, calculate_total
from services.solana_service import record_ownership_on_chain, get_ownership_pda
from google.cloud.firestore_v1.base_query import FieldFilter
from google.cloud.firestore_v1 import ArrayUnion

router = APIRouter(prefix="/tokens", tags=["Tokens"])


@router.post("/order", response_model=PaymentOrderOut)
async def create_payment_order(
    body: PaymentOrderCreate,
    user: dict = Depends(get_current_user),
):
    """
    Step 1 of fiat purchase: create a mock payment order.
    Frontend shows a simulated payment UI with this order.
    """
    prop_doc = db.collection("properties").document(body.property_id).get()
    if not prop_doc.exists:
        raise HTTPException(status_code=404, detail="Property not found")

    prop = prop_doc.to_dict()
    if prop.get("available_tokens", 0) < body.quantity:
        raise HTTPException(status_code=400, detail="Not enough tokens available")

    order = create_mock_order(body.property_id, body.quantity, prop["token_price"])

    # Persist pending order in Firebase
    db.collection("payment_orders").document(order["order_id"]).set({
        **order,
        "user_id": user["id"],
        "status": "created",
    })

    return PaymentOrderOut(
        order_id=order["order_id"],
        amount=int(order["amount"] * 100),   # in paise for display
        currency="INR",
        key_id="MOCK_KEY",
        property_id=body.property_id,
        quantity=body.quantity,
    )


@router.post("/purchase", response_model=TokenPurchaseOut)
async def purchase_tokens(
    body: TokenPurchaseRequest,
    user: dict = Depends(get_current_user),
):
    """
    Step 2: confirm purchase after payment.
    For fiat: pass order_id + payment_id (from mock payment).
    For crypto: pass wallet_address (blockchain handles transfer).
    """
    prop_doc = db.collection("properties").document(body.property_id).get()
    if not prop_doc.exists:
        raise HTTPException(status_code=404, detail="Property not found")

    prop = prop_doc.to_dict()

    if prop.get("available_tokens", 0) < body.quantity:
        raise HTTPException(status_code=400, detail="Not enough tokens available")

    totals = calculate_total(prop["token_price"], body.quantity)

    # ── Payment verification ──────────────────────────────────────────────────
    if body.payment_method == "fiat":
        if not body.razorpay_payment_id:
            # Auto-simulate payment for demo
            sim = simulate_payment(f"order_demo_{body.property_id}")
            payment_id = sim["payment_id"]
        else:
            payment_id = body.razorpay_payment_id
    else:
        # Crypto: wallet must be connected
        if not body.wallet_address:
            raise HTTPException(status_code=400, detail="wallet_address required for crypto purchase")
        payment_id = f"crypto_{uuid.uuid4().hex[:12]}"

    # ── Record on blockchain ──────────────────────────────────────────────────
    wallet = body.wallet_address or user.get("wallet_address") or "platform_escrow"
    blockchain_tx = await record_ownership_on_chain(wallet, body.property_id, body.quantity)

    # ── Update Firestore ──────────────────────────────────────────────────────
    transaction_id = f"txn_{uuid.uuid4().hex[:16]}"
    now = datetime.utcnow()

    # Deduct available tokens + append price history snapshot
    db.collection("properties").document(body.property_id).update({
        "available_tokens": prop["available_tokens"] - body.quantity,
        "sold_tokens": prop.get("sold_tokens", 0) + body.quantity,
        "funds_raised": prop.get("funds_raised", 0) + totals["total"],
        "price_history": ArrayUnion([{
            "date": now.strftime("%Y-%m"),
            "price": prop["token_price"]
        }])
    })

    # Create/update ownership record
    ownership_ref = (
        db.collection("ownership")
        .where(filter=FieldFilter("user_id", "==", user["id"]))
        .where(filter=FieldFilter("property_id", "==", body.property_id))
        .get()
    )
    if ownership_ref:
        existing = ownership_ref[0]
        old_tokens = existing.to_dict().get("tokens_owned", 0)
        existing.reference.update({"tokens_owned": old_tokens + body.quantity})
    else:
        db.collection("ownership").add({
            "user_id": user["id"],
            "property_id": body.property_id,
            "property_title": prop["title"],
            "property_type": prop.get("property_type", "Commercial"),
            "location": f"{prop['location']}, {prop['city']}",
            "tokens_owned": body.quantity,
            "purchase_price": prop["token_price"],
            "current_price": prop["token_price"],
            "purchase_date": now.strftime("%Y-%m-%d"),
            "rental_income": 0,
            "unrealized_pl": 0,
            "unrealized_pl_percent": 0,
        })

    # Log transaction
    db.collection("transactions").add({
        "id": transaction_id,
        "user_id": user["id"],
        "property_id": body.property_id,
        "property_title": prop["title"],
        "type": "buy",
        "tokens": body.quantity,
        "amount": totals["total"],
        "platform_fee": totals["platform_fee"],
        "payment_method": body.payment_method,
        "payment_id": payment_id,
        "blockchain_tx": blockchain_tx,
        "status": "completed",
        "date": now.strftime("%Y-%m-%d"),
        "created_at": now.isoformat(),
    })

    # Update user stats
    db.collection("users").document(user["id"]).update({
        "total_invested": user.get("total_invested", 0) + totals["total"],
        "properties_owned": user.get("properties_owned", 0) + (0 if ownership_ref else 1),
    })

    return TokenPurchaseOut(
        transaction_id=transaction_id,
        property_id=body.property_id,
        tokens=body.quantity,
        amount_paid=totals["total"],
        platform_fee=totals["platform_fee"],
        blockchain_tx=blockchain_tx,
        status="completed",
    )


@router.post("/sell", response_model=TokenSellOut)
async def sell_tokens(
    property_id: str,
    quantity: int,
    user: dict = Depends(get_current_user),
):
    """Sell tokens back to the marketplace."""
    if quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than 0")

    ownership = (
        db.collection("ownership")
        .where(filter=FieldFilter("user_id", "==", user["id"]))
        .where(filter=FieldFilter("property_id", "==", property_id))
        .get()
    )
    if not ownership:
        raise HTTPException(status_code=404, detail="You don't own tokens for this property")

    holding = ownership[0].to_dict()
    if holding["tokens_owned"] < quantity:
        raise HTTPException(status_code=400, detail=f"Insufficient tokens. You own {holding['tokens_owned']} tokens")

    prop_doc = db.collection("properties").document(property_id).get()
    if not prop_doc.exists:
        raise HTTPException(status_code=404, detail="Property not found")

    prop = prop_doc.to_dict()
    sale_amount = prop["token_price"] * quantity
    transaction_id = f"txn_{uuid.uuid4().hex[:16]}"
    now = datetime.utcnow()

    # ── Record sell on blockchain ─────────────────────────────────────────────
    wallet = user.get("wallet_address") or "platform_escrow"
    ownership_pda = get_ownership_pda(wallet, property_id)
    blockchain_tx = f"SELL_{uuid.uuid4().hex[:16].upper()}"

    # ── Update ownership in Firebase ─────────────────────────────────────────
    new_tokens = holding["tokens_owned"] - quantity
    if new_tokens == 0:
        ownership[0].reference.delete()
    else:
        ownership[0].reference.update({"tokens_owned": new_tokens})

    # ── Return tokens to available pool ──────────────────────────────────────
    db.collection("properties").document(property_id).update({
        "available_tokens": prop.get("available_tokens", 0) + quantity,
        "sold_tokens": max(0, prop.get("sold_tokens", 0) - quantity),
    })

    # ── Log transaction ───────────────────────────────────────────────────────
    db.collection("transactions").add({
        "id": transaction_id,
        "user_id": user["id"],
        "property_id": property_id,
        "property_title": prop["title"],
        "type": "sell",
        "tokens": quantity,
        "amount": sale_amount,
        "blockchain_tx": blockchain_tx,
        "ownership_pda": ownership_pda,
        "status": "completed",
        "date": now.strftime("%Y-%m-%d"),
        "created_at": now.isoformat(),
    })

    # ── Update user stats ─────────────────────────────────────────────────────
    db.collection("users").document(user["id"]).update({
        "total_invested": max(0, user.get("total_invested", 0) - sale_amount),
        "properties_owned": max(0, user.get("properties_owned", 0) - (1 if new_tokens == 0 else 0)),
    })

    return TokenSellOut(
        transaction_id=transaction_id,
        property_id=property_id,
        tokens_sold=quantity,
        amount_received=sale_amount,
        blockchain_tx=blockchain_tx,
        status="completed",
    )
