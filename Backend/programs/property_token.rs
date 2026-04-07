use anchor_lang::prelude::*;

declare_id!("YourProgramIdHere11111111111111111111111111");

#[program]
pub mod property_token {
    use super::*;

    /// Register a property and define its token supply.
    pub fn register_property(
        ctx: Context<RegisterProperty>,
        property_id: String,
        total_tokens: u64,
        token_price_lamports: u64,
        annual_yield_bps: u16,   // basis points e.g. 850 = 8.5%
    ) -> Result<()> {
        let property = &mut ctx.accounts.property;
        property.authority      = ctx.accounts.authority.key();
        property.property_id    = property_id;
        property.total_tokens   = total_tokens;
        property.available_tokens = total_tokens;
        property.token_price    = token_price_lamports;
        property.annual_yield_bps = annual_yield_bps;
        property.is_active      = true;
        Ok(())
    }

    /// Investor buys tokens for a property.
    pub fn buy_tokens(
        ctx: Context<BuyTokens>,
        quantity: u64,
    ) -> Result<()> {
        let property = &mut ctx.accounts.property;
        require!(property.is_active, PropertyError::NotActive);
        require!(property.available_tokens >= quantity, PropertyError::InsufficientTokens);

        let total_cost = property.token_price
            .checked_mul(quantity)
            .ok_or(PropertyError::Overflow)?;

        // Transfer SOL from buyer to platform escrow
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.buyer.key(),
            &ctx.accounts.escrow.key(),
            total_cost,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.buyer.to_account_info(),
                ctx.accounts.escrow.to_account_info(),
            ],
        )?;

        // Update property state
        property.available_tokens -= quantity;

        // Update ownership record
        let ownership = &mut ctx.accounts.ownership;
        ownership.owner         = ctx.accounts.buyer.key();
        ownership.property      = property.key();
        ownership.tokens_owned  += quantity;
        ownership.purchase_price = property.token_price;

        emit!(TokensPurchased {
            buyer: ctx.accounts.buyer.key(),
            property_id: property.property_id.clone(),
            quantity,
            total_cost,
        });

        Ok(())
    }

    /// Transfer tokens between two investors.
    pub fn transfer_tokens(
        ctx: Context<TransferTokens>,
        quantity: u64,
    ) -> Result<()> {
        let from_ownership = &mut ctx.accounts.from_ownership;
        let to_ownership   = &mut ctx.accounts.to_ownership;

        require!(from_ownership.tokens_owned >= quantity, PropertyError::InsufficientTokens);

        from_ownership.tokens_owned -= quantity;
        to_ownership.tokens_owned   += quantity;

        emit!(TokensTransferred {
            from: ctx.accounts.from.key(),
            to: ctx.accounts.to.key(),
            quantity,
        });

        Ok(())
    }
}

// ── Accounts ──────────────────────────────────────────────────────────────────

#[derive(Accounts)]
#[instruction(property_id: String)]
pub struct RegisterProperty<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + PropertyState::LEN,
        seeds = [b"property", property_id.as_bytes()],
        bump
    )]
    pub property: Account<'info, PropertyState>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BuyTokens<'info> {
    #[account(mut)]
    pub property: Account<'info, PropertyState>,

    #[account(
        init_if_needed,
        payer = buyer,
        space = 8 + OwnershipRecord::LEN,
        seeds = [b"ownership", buyer.key().as_ref(), property.key().as_ref()],
        bump
    )]
    pub ownership: Account<'info, OwnershipRecord>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    /// CHECK: platform escrow wallet
    #[account(mut)]
    pub escrow: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct TransferTokens<'info> {
    #[account(mut, has_one = owner @ PropertyError::Unauthorized)]
    pub from_ownership: Account<'info, OwnershipRecord>,

    #[account(mut)]
    pub to_ownership: Account<'info, OwnershipRecord>,

    pub from: Signer<'info>,

    /// CHECK: recipient wallet
    pub to: AccountInfo<'info>,
}

// ── State ─────────────────────────────────────────────────────────────────────

#[account]
pub struct PropertyState {
    pub authority:        Pubkey,
    pub property_id:      String,   // max 32 chars
    pub total_tokens:     u64,
    pub available_tokens: u64,
    pub token_price:      u64,      // in lamports
    pub annual_yield_bps: u16,
    pub is_active:        bool,
}

impl PropertyState {
    pub const LEN: usize = 32 + 36 + 8 + 8 + 8 + 2 + 1;
}

#[account]
pub struct OwnershipRecord {
    pub owner:          Pubkey,
    pub property:       Pubkey,
    pub tokens_owned:   u64,
    pub purchase_price: u64,
}

impl OwnershipRecord {
    pub const LEN: usize = 32 + 32 + 8 + 8;
}

// ── Events ────────────────────────────────────────────────────────────────────

#[event]
pub struct TokensPurchased {
    pub buyer:       Pubkey,
    pub property_id: String,
    pub quantity:    u64,
    pub total_cost:  u64,
}

#[event]
pub struct TokensTransferred {
    pub from:     Pubkey,
    pub to:       Pubkey,
    pub quantity: u64,
}

// ── Errors ────────────────────────────────────────────────────────────────────

#[error_code]
pub enum PropertyError {
    #[msg("Property is not active")]
    NotActive,
    #[msg("Not enough tokens available")]
    InsufficientTokens,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Unauthorized")]
    Unauthorized,
}
