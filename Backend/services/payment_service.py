"""
Mock Payment Service — simulates fiat payment flow without any real gateway.
Generates fake order IDs and payment confirmations for hackathon demo.
"""
import uuid
import time
from config import PLATFORM_FEE_PERCENT


def calculate_total(token_price: float, quantity: int) -> dict:
    subtotal = token_price * quantity
    fee = round(subtotal * (PLATFORM_FEE_PERCENT / 100), 2)
    return {
        "subtotal": subtotal,
        "platform_fee": fee,
        "total": round(subtotal + fee, 2),
    }


def create_mock_order(property_id: str, quantity: int, token_price: float) -> dict:
    """Simulate creating a payment order (like Razorpay order creation)."""
    totals = calculate_total(token_price, quantity)
    return {
        "order_id": f"order_{uuid.uuid4().hex[:16]}",
        "property_id": property_id,
        "quantity": quantity,
        "amount": totals["total"],
        "platform_fee": totals["platform_fee"],
        "currency": "INR",
        "status": "created",
        "created_at": int(time.time()),
    }


def simulate_payment(order_id: str) -> dict:
    """Simulate a successful payment confirmation."""
    return {
        "payment_id": f"pay_{uuid.uuid4().hex[:16]}",
        "order_id": order_id,
        "status": "captured",
        "method": "upi",          # simulated UPI/eMandate
        "captured_at": int(time.time()),
    }


def verify_mock_payment(order_id: str, payment_id: str) -> bool:
    """For simulation: any non-empty IDs are considered valid."""
    return bool(order_id and payment_id)
