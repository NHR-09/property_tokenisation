use anchor_lang::prelude::*;
use crate::state::{PropertyState, OwnershipRecord};
use crate::constants::*;
use crate::error::ErrorCode;

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
        constraint = ownership.owner == seller.key() @ ErrorCode::Unauthorized
    )]
    pub ownership: Account<'info, OwnershipRecord>,

    #[account(mut)]
    pub seller: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<SellTokens>, property_id: String, quantity: u64) -> Result<()> {
    require!(quantity > 0, ErrorCode::InvalidQuantity);
    require!(
        ctx.accounts.ownership.tokens_owned >= quantity,
        ErrorCode::InsufficientOwnership
    );

    // Update ownership
    let ownership = &mut ctx.accounts.ownership;
    ownership.tokens_owned = ownership.tokens_owned
        .checked_sub(quantity)
        .ok_or(ErrorCode::Overflow)?;

    // Return tokens to available pool
    let property = &mut ctx.accounts.property;
    property.available_tokens = property.available_tokens
        .checked_add(quantity)
        .ok_or(ErrorCode::Overflow)?;
    property.sold_tokens = property.sold_tokens
        .checked_sub(quantity)
        .ok_or(ErrorCode::Overflow)?;

    emit!(TokensSold {
        seller: ctx.accounts.seller.key(),
        property_id,
        quantity,
    });

    Ok(())
}

#[event]
pub struct TokensSold {
    pub seller: Pubkey,
    pub property_id: String,
    pub quantity: u64,
}
