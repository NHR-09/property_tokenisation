use anchor_lang::prelude::*;
use anchor_lang::system_program::{self, Transfer};

declare_id!("EHb76xADX6VJGAm1sBXbEAx6bDppvpnvGCKyhaJWMd8N");

// ── Seeds ─────────────────────────────────────────────────────────────────
const PROPERTY_SEED: &[u8] = b"property";
const OWNERSHIP_SEED: &[u8] = b"ownership";

// ── Program ───────────────────────────────────────────────────────────────
#[program]
pub mod property_token {
    use super::*;

    pub fn register_property(
        ctx: Context<RegisterProperty>,
        property_id: String,
        total_tokens: u64,
        token_price_lamports: u64,
        annual_yield_bps: u16,
    ) -> Result<()> {
        require!(property_id.len() <= 36, PropertyError::PropertyIdTooLong);
        require!(total_tokens > 0, PropertyError::InvalidQuantity);

        let p = &mut ctx.accounts.property;
        p.authority = ctx.accounts.authority.key();
        p.seller = ctx.accounts.seller.key();
        p.property_id = property_id;
        p.total_tokens = total_tokens;
        p.available_tokens = total_tokens;
        p.sold_tokens = 0;
        p.token_price_lamports = token_price_lamports;
        p.annual_yield_bps = annual_yield_bps;
        p.is_active = true;
        p.funds_raised_lamports = 0;
        p.bump = ctx.bumps.property;
        Ok(())
    }

    pub fn buy_tokens(ctx: Context<BuyTokens>, property_id: String, quantity: u64) -> Result<()> {
        require!(ctx.accounts.property.is_active, PropertyError::PropertyNotActive);
        require!(quantity > 0, PropertyError::InvalidQuantity);
        require!(
            ctx.accounts.property.available_tokens >= quantity,
            PropertyError::InsufficientTokens
        );

        let token_price = ctx.accounts.property.token_price_lamports;
        let total_cost = token_price.checked_mul(quantity).ok_or(PropertyError::Overflow)?;
        let fee = total_cost.checked_div(100).ok_or(PropertyError::Overflow)?;
        let amount = total_cost.checked_add(fee).ok_or(PropertyError::Overflow)?;

        // Transfer SOL buyer → escrow
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.key(),
                Transfer {
                    from: ctx.accounts.buyer.to_account_info(),
                    to: ctx.accounts.escrow.to_account_info(),
                },
            ),
            amount,
        )?;

        // Update property
        let p = &mut ctx.accounts.property;
        p.available_tokens -= quantity;
        p.sold_tokens += quantity;
        p.funds_raised_lamports += total_cost;

        // Update ownership
        let o = &mut ctx.accounts.ownership;
        if o.tokens_owned == 0 {
            o.owner = ctx.accounts.buyer.key();
            o.property_id = property_id.clone();
            o.purchase_price_lamports = token_price;
            o.bump = ctx.bumps.ownership;
        }
        o.tokens_owned += quantity;
        o.total_invested_lamports += total_cost;

        emit!(TokensPurchased {
            buyer: ctx.accounts.buyer.key(),
            property_id,
            quantity,
            amount_paid: amount,
        });
        Ok(())
    }

    pub fn sell_tokens(ctx: Context<SellTokens>, property_id: String, quantity: u64) -> Result<()> {
        require!(quantity > 0, PropertyError::InvalidQuantity);
        require!(
            ctx.accounts.ownership.tokens_owned >= quantity,
            PropertyError::InsufficientOwnership
        );

        ctx.accounts.ownership.tokens_owned -= quantity;
        ctx.accounts.property.available_tokens += quantity;
        ctx.accounts.property.sold_tokens -= quantity;

        emit!(TokensSold {
            seller: ctx.accounts.seller.key(),
            property_id,
            quantity,
        });
        Ok(())
    }
}

// ── Accounts ──────────────────────────────────────────────────────────────
#[derive(Accounts)]
#[instruction(property_id: String)]
pub struct RegisterProperty<'info> {
    #[account(
        init,
        payer = authority,
        space = PropertyState::LEN,
        seeds = [PROPERTY_SEED, property_id.as_bytes()],
        bump
    )]
    pub property: Account<'info, PropertyState>,
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: seller wallet
    pub seller: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(property_id: String)]
pub struct BuyTokens<'info> {
    #[account(
        mut,
        seeds = [PROPERTY_SEED, property_id.as_bytes()],
        bump = property.bump
    )]
    pub property: Account<'info, PropertyState>,
    #[account(
        init_if_needed,
        payer = buyer,
        space = OwnershipRecord::LEN,
        seeds = [OWNERSHIP_SEED, buyer.key().as_ref(), property_id.as_bytes()],
        bump
    )]
    pub ownership: Account<'info, OwnershipRecord>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    /// CHECK: escrow wallet
    #[account(mut)]
    pub escrow: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(property_id: String)]
pub struct SellTokens<'info> {
    #[account(
        mut,
        seeds = [PROPERTY_SEED, property_id.as_bytes()],
        bump = property.bump
    )]
    pub property: Account<'info, PropertyState>,
    #[account(
        mut,
        seeds = [OWNERSHIP_SEED, seller.key().as_ref(), property_id.as_bytes()],
        bump = ownership.bump,
        constraint = ownership.owner == seller.key() @ PropertyError::Unauthorized
    )]
    pub ownership: Account<'info, OwnershipRecord>,
    #[account(mut)]
    pub seller: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// ── State ─────────────────────────────────────────────────────────────────
#[account]
pub struct PropertyState {
    pub authority: Pubkey,
    pub seller: Pubkey,
    pub property_id: String,
    pub total_tokens: u64,
    pub available_tokens: u64,
    pub sold_tokens: u64,
    pub token_price_lamports: u64,
    pub annual_yield_bps: u16,
    pub is_active: bool,
    pub funds_raised_lamports: u64,
    pub bump: u8,
}

impl PropertyState {
    pub const LEN: usize = 8 + 32 + 32 + (4 + 36) + 8 + 8 + 8 + 8 + 2 + 1 + 8 + 1;
}

#[account]
pub struct OwnershipRecord {
    pub owner: Pubkey,
    pub property_id: String,
    pub tokens_owned: u64,
    pub purchase_price_lamports: u64,
    pub total_invested_lamports: u64,
    pub bump: u8,
}

impl OwnershipRecord {
    pub const LEN: usize = 8 + 32 + (4 + 36) + 8 + 8 + 8 + 1;
}

// ── Events ────────────────────────────────────────────────────────────────
#[event]
pub struct TokensPurchased {
    pub buyer: Pubkey,
    pub property_id: String,
    pub quantity: u64,
    pub amount_paid: u64,
}

#[event]
pub struct TokensSold {
    pub seller: Pubkey,
    pub property_id: String,
    pub quantity: u64,
}

// ── Errors ────────────────────────────────────────────────────────────────
#[error_code]
pub enum PropertyError {
    #[msg("Property is not active")]
    PropertyNotActive,
    #[msg("Not enough tokens available")]
    InsufficientTokens,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Invalid quantity")]
    InvalidQuantity,
    #[msg("Insufficient tokens to sell")]
    InsufficientOwnership,
    #[msg("Property ID too long")]
    PropertyIdTooLong,
}
