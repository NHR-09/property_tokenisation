use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Property is not active")]
    PropertyNotActive,
    #[msg("Not enough tokens available")]
    InsufficientTokens,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Unauthorized - not the property authority")]
    Unauthorized,
    #[msg("Insufficient SOL balance for purchase")]
    InsufficientFunds,
    #[msg("Invalid token quantity - must be greater than 0")]
    InvalidQuantity,
    #[msg("Investor does not own enough tokens to sell")]
    InsufficientOwnership,
    #[msg("Property ID too long - max 36 characters")]
    PropertyIdTooLong,
}
