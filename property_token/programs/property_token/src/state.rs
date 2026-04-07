use anchor_lang::prelude::*;

// ── Property State ─────────────────────────────────────────────────────────
#[account]
pub struct PropertyState {
    pub authority: Pubkey,        // Platform admin who registered the property
    pub seller: Pubkey,           // Property seller
    pub property_id: String,      // Firebase property ID (max 36 chars)
    pub total_tokens: u64,        // Total tokens issued
    pub available_tokens: u64,    // Tokens available for purchase
    pub sold_tokens: u64,         // Tokens sold so far
    pub token_price_lamports: u64, // Price per token in lamports
    pub annual_yield_bps: u16,    // Annual yield in basis points (850 = 8.5%)
    pub is_active: bool,          // Whether property is active for trading
    pub funds_raised_lamports: u64, // Total SOL raised
    pub bump: u8,
}

impl PropertyState {
    pub const LEN: usize = 8   // discriminator
        + 32   // authority
        + 32   // seller
        + 4 + 36  // property_id string
        + 8    // total_tokens
        + 8    // available_tokens
        + 8    // sold_tokens
        + 8    // token_price_lamports
        + 2    // annual_yield_bps
        + 1    // is_active
        + 8    // funds_raised_lamports
        + 1;   // bump
}

// ── Ownership Record ───────────────────────────────────────────────────────
#[account]
pub struct OwnershipRecord {
    pub owner: Pubkey,            // Investor wallet
    pub property: Pubkey,         // Property state account
    pub property_id: String,      // Firebase property ID
    pub tokens_owned: u64,        // Number of tokens owned
    pub purchase_price_lamports: u64, // Average purchase price
    pub total_invested_lamports: u64, // Total SOL invested
    pub bump: u8,
}

impl OwnershipRecord {
    pub const LEN: usize = 8   // discriminator
        + 32   // owner
        + 32   // property
        + 4 + 36  // property_id string
        + 8    // tokens_owned
        + 8    // purchase_price_lamports
        + 8    // total_invested_lamports
        + 1;   // bump
}

// ── Platform Config ────────────────────────────────────────────────────────
#[account]
pub struct PlatformConfig {
    pub authority: Pubkey,        // Platform admin
    pub fee_bps: u16,             // Platform fee in basis points (100 = 1%)
    pub escrow: Pubkey,           // Escrow wallet for funds
    pub bump: u8,
}

impl PlatformConfig {
    pub const LEN: usize = 8 + 32 + 2 + 32 + 1;
}
