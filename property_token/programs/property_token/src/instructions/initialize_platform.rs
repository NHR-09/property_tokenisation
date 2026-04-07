use anchor_lang::prelude::*;
use crate::state::PlatformConfig;
use crate::constants::*;

#[derive(Accounts)]
pub struct InitializePlatform<'info> {
    #[account(
        init,
        payer = authority,
        space = PlatformConfig::LEN,
        seeds = [PLATFORM_SEED],
        bump
    )]
    pub platform: Account<'info, PlatformConfig>,

    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: escrow wallet
    pub escrow: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializePlatform>, fee_bps: u16) -> Result<()> {
    let platform = &mut ctx.accounts.platform;
    platform.authority = ctx.accounts.authority.key();
    platform.escrow = ctx.accounts.escrow.key();
    platform.fee_bps = fee_bps;
    platform.bump = ctx.bumps.platform;
    Ok(())
}
