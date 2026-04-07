from fastapi import APIRouter, HTTPException, Depends
from config import db
from models.schemas import PaymentOrderCreate, PaymentOrderOut
from services.auth_service import get_current_user
from services.payment_service import create_mock_order, simulate_payment, calculate_total

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post("/create-order", response_model=PaymentOrderOut)
async def create_order(body: PaymentOrderCreate, user: dict = Depends(get_current_user)):
    """Creates a simulated payment order for fiat token purchase."""
    prop_doc = db.collection("properties").document(body.property_id).get()
    if not prop_doc.exists:
        raise HTTPException(status_code=404, detail="Property not found")

    prop = prop_doc.to_dict()
    if prop.get("available_tokens", 0) < body.quantity:
        raise HTTPException(status_code=400, detail="Not enough tokens available")

    order = create_mock_order(body.property_id, body.quantity, prop["token_price"])

    db.collection("payment_orders").document(order["order_id"]).set({
        **order,
        "user_id": user["id"],
    })

    return PaymentOrderOut(
        order_id=order["order_id"],
        amount=int(order["amount"] * 100),
        currency="INR",
        key_id="MOCK_PAYMENT_GATEWAY",
        property_id=body.property_id,
        quantity=body.quantity,
    )


@router.post("/simulate/{order_id}")
async def simulate_payment_completion(order_id: str, user: dict = Depends(get_current_user)):
    """
    Simulates a successful payment — call this instead of a real gateway callback.
    Returns a payment_id to pass into POST /tokens/purchase.
    """
    order_doc = db.collection("payment_orders").document(order_id).get()
    if not order_doc.exists:
        raise HTTPException(status_code=404, detail="Order not found")

    order = order_doc.to_dict()
    if order.get("user_id") != user["id"]:
        raise HTTPException(status_code=403, detail="Not your order")

    payment = simulate_payment(order_id)

    db.collection("payment_orders").document(order_id).update({
        "status": "captured",
        "payment_id": payment["payment_id"],
    })

    return {
        "payment_id": payment["payment_id"],
        "order_id": order_id,
        "status": "captured",
        "message": "Payment simulated successfully. Use payment_id to confirm token purchase.",
    }


@router.get("/order/{order_id}")
async def get_order_status(order_id: str, user: dict = Depends(get_current_user)):
    doc = db.collection("payment_orders").document(order_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Order not found")
    return doc.to_dict()
