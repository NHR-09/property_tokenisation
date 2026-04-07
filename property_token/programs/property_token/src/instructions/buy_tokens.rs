use anchor_lang::prelude::*;
use anchor_lang::system_program::{self, Transfer};
use crate::state::{PropertyState, OwnershipRecord};
use crate::constants::*;
use crate::error::ErrorCode;

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

    /// CHECK: escrow wallet receives SOL
    #[account(mut)]
    pub escrow: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<BuyTokens>, property_id: String, quantity: u64) -> Result<()> {
    require!(ctx.accounts.property.is_active, ErrorCode::PropertyNotActive);
    require!(quantity > 0, ErrorCode::InvalidQuantity);
    require!(
        ctx.accounts.property.available_tokens >= quantity,
        ErrorCode::InsufficientTokens
    );

    let token_price = ctx.accounts.property.token_price_lamports;
    let total_cost = token_price
        .checked_mul(quantity)
        .ok_or(ErrorCode::Overflow)?;

    // Platform fee (1%)
    let fee = total_cost.checked_div(100).ok_or(ErrorCode::Overflow)?;
    let amount_to_escrow = total_cost.checked_add(fee).ok_or(ErrorCode::Overflow)?;

    // Transfer SOL from buyer to escrow
    let cpi_accounts = Transfer {
        from: ctx.accounts.buyer.to_account_info(),
        to: ctx.accounts.escrow.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(ctx.accounts.system_program.to_account_info(), cpi_accounts);
    system_program::transfer(cpi_ctx, amount_to_escrow)?;

    // Update property state
    let property = &mut ctx.accounts.property;
    property.available_tokens = property.available_tokens
        .checked_sub(quantity)
        .ok_or(ErrorCode::Overflow)?;
    property.sold_tokens = property.sold_tokens
        .checked_add(quantity)
        .ok_or(ErrorCode::Overflow)?;
    property.funds_raised_lamports = property.funds_raised_lamports
        .checked_add(total_cost)
        .ok_or(ErrorCode::Overflow)?;

    // Update ownership record
    let ownership = &mut ctx.accounts.ownership;
    if ownership.tokens_owned == 0 {
        ownership.owner = ctx.accounts.buyer.key();
        ownership.property = property.key();
        ownership.property_id = property_id.clone();
        ownership.purchase_price_lamports = token_price;
        ownership.bump = ctx.bumps.ownership;
    }
    ownership.tokens_owned = ownership.tokens_owned
        .checked_add(quantity)
        .ok_or(ErrorCode::Overflow)?;
    ownership.total_invested_lamports = ownership.total_invested_lamports
        .checked_add(total_cost)
        .ok_or(ErrorCode::Overflow)?;

    emit!(TokensPurchased {
        buyer: ctx.accounts.buyer.key(),
        property_id,
        quantity,
        total_cost_lamports: amount_to_escrow,
    });

    Ok(())
}

#[event]
pub struct TokensPurchased {
    pub buyer: Pubkey,
    pub property_id: String,
    pub quantity: u64,
    pub total_cost_lamports: u64,
}
