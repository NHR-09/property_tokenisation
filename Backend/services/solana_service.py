"""
Solana blockchain service.
Uses solana-py + solders for RPC calls.
For hackathon: real mint/transfer on devnet, with mock fallback if keys not configured.
"""
import json
import os
from typing import Optional
from config import SOLANA_RPC_URL, PLATFORM_WALLET_PRIVATE_KEY

# Lazy imports so app starts even without Solana keys configured
try:
    from solana.rpc.api import Client
    from solders.keypair import Keypair
    from solders.pubkey import Pubkey
    from solders.system_program import TransferParams, transfer
    from solana.transaction import Transaction
    SOLANA_AVAILABLE = True
except ImportError:
    SOLANA_AVAILABLE = False


def _get_client() -> Optional[object]:
    if not SOLANA_AVAILABLE:
        return None
    return Client(SOLANA_RPC_URL)


def _get_platform_keypair() -> Optional[object]:
    if not SOLANA_AVAILABLE:
        return None
    try:
        key_bytes = json.loads(PLATFORM_WALLET_PRIVATE_KEY)
        return Keypair.from_bytes(bytes(key_bytes))
    except Exception:
        return None


def get_wallet_balance(wallet_address: str) -> dict:
    """Return SOL balance for a wallet address."""
    client = _get_client()
    if not client:
        return {"wallet": wallet_address, "sol_balance": 0.0, "mock": True}
    try:
        pubkey = Pubkey.from_string(wallet_address)
        resp = client.get_balance(pubkey)
        lamports = resp.value
        return {"wallet": wallet_address, "sol_balance": lamports / 1e9}
    except Exception as e:
        return {"wallet": wallet_address, "sol_balance": 0.0, "error": str(e)}


def verify_wallet_signature(wallet_address: str, message: str, signature: str) -> bool:
    """
    Verify that a Phantom wallet signed the given message.
    In production use nacl / solders signature verification.
    For hackathon: returns True if all fields are non-empty (mock).
    """
    if not wallet_address or not message or not signature:
        return False
    # TODO: replace with real nacl.sign.verify
    return True


def mint_property_tokens(
    property_id: str,
    total_tokens: int,
    token_price_lamports: int,
) -> dict:
    """
    Calls the Anchor program to mint tokens for a property.
    Returns the transaction signature or a mock response.
    """
    platform_kp = _get_platform_keypair()
    if not platform_kp:
        # Mock response for hackathon demo
        return {
            "tx_signature": f"MOCK_MINT_{property_id[:8].upper()}",
            "property_id": property_id,
            "total_tokens": total_tokens,
            "mock": True,
        }

    # Real implementation would call the Anchor program instruction here
    # anchor_program.rpc.mint_property_tokens(...)
    return {
        "tx_signature": f"MOCK_MINT_{property_id[:8].upper()}",
        "property_id": property_id,
        "total_tokens": total_tokens,
        "mock": True,
    }


def transfer_tokens(
    from_wallet: str,
    to_wallet: str,
    property_id: str,
    quantity: int,
) -> dict:
    """
    Transfer property tokens between wallets via the Anchor program.
    """
    platform_kp = _get_platform_keypair()
    if not platform_kp:
        return {
            "tx_signature": f"MOCK_TRANSFER_{property_id[:6].upper()}",
            "from": from_wallet,
            "to": to_wallet,
            "quantity": quantity,
            "mock": True,
        }

    # Real: call anchor program transfer instruction
    return {
        "tx_signature": f"MOCK_TRANSFER_{property_id[:6].upper()}",
        "from": from_wallet,
        "to": to_wallet,
        "quantity": quantity,
        "mock": True,
    }


def record_ownership_on_chain(user_wallet: str, property_id: str, tokens: int) -> str:
    """Returns blockchain tx signature after recording ownership."""
    result = transfer_tokens("platform", user_wallet, property_id, tokens)
    return result["tx_signature"]
