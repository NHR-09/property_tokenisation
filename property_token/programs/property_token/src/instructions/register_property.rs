use anchor_lang::prelude::*;
use crate::state::PropertyState;
use crate::constants::*;
use crate::error::ErrorCode;

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

pub fn handler(
    ctx: Context<RegisterProperty>,
    property_id: String,
    total_tokens: u64,
    token_price_lamports: u64,
    annual_yield_bps: u16,
) -> Result<()> {
    require!(property_id.len() <= MAX_PROPERTY_ID_LEN, ErrorCode::PropertyIdTooLong);
    require!(total_tokens > 0, ErrorCode::InvalidQuantity);

    let property = &mut ctx.accounts.property;
    property.authority = ctx.accounts.authority.key();
    property.seller = ctx.accounts.seller.key();
    property.property_id = property_id;
    property.total_tokens = total_tokens;
    property.available_tokens = total_tokens;
    property.sold_tokens = 0;
    property.token_price_lamports = token_price_lamports;
    property.annual_yield_bps = annual_yield_bps;
    property.is_active = true;
    property.funds_raised_lamports = 0;
    property.bump = ctx.bumps.property;

    emit!(PropertyRegistered {
        property_id: property.property_id.clone(),
        total_tokens,
        token_price_lamports,
        seller: ctx.accounts.seller.key(),
    });

    Ok(())
}

#[event]
pub struct PropertyRegistered {
    pub property_id: String,
    pub total_tokens: u64,
    pub token_price_lamports: u64,
    pub seller: Pubkey,
}
