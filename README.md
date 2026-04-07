# 7/12 – Property as Token

A blockchain-powered fractional real estate investment platform that enables investors to own tokenized shares of premium properties starting from ₹5,000.

## Overview

7/12 democratizes real estate investing by converting property ownership into tradable digital tokens. Named after the "7/12 Extract" - the official land ownership document in India - the platform bridges traditional real estate with modern blockchain technology.

## Features

### For Investors
- **Fractional Ownership** - Own shares of premium properties with investments as low as ₹5,000
- **Portfolio Dashboard** - Track holdings, returns, and transaction history
- **Property Marketplace** - Browse verified properties with detailed analytics
- **Instant Liquidity** - Trade tokens on secondary marketplace
- **Governance Voting** - Participate in property decisions based on token holdings

### For Property Sellers
- **Property Tokenization** - Convert properties into tradable digital tokens
- **Seller Dashboard** - Monitor token sales and investor activity
- **6-Step Onboarding** - Guided process for property verification and listing

### For Administrators
- **KYC Management** - Review and approve investor verifications
- **Property Approvals** - Verify and approve property listings
- **Risk Monitoring** - Flag and manage suspicious activities
- **User Management** - Oversee platform users and permissions

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, features, and FAQ |
| `/marketplace` | Property listings with search and filters |
| `/properties/[id]` | Property details, ownership info, documents |
| `/dashboard` | Investor dashboard with portfolio overview |
| `/portfolio` | Detailed holdings and income history |
| `/governance` | Voting on property proposals |
| `/seller` | Seller dashboard for property management |
| `/seller/onboard` | Multi-step property onboarding form |
| `/admin` | Admin panel for platform management |

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Animations**: CSS animations with Intersection Observer
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
pnpm install

# Run development server
pnpm dev
**Project Structure**
├── app/
│   ├── page.tsx              # Landing page
│   ├── marketplace/          # Property marketplace
│   ├── properties/[id]/      # Property details
│   ├── dashboard/            # Investor dashboard
│   ├── portfolio/            # Portfolio management
│   ├── governance/           # Voting/governance
│   ├── seller/               # Seller dashboard & onboarding
│   └── admin/                # Admin dashboard
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── navbar.tsx            # Navigation bar
│   ├── footer.tsx            # Site footer
│   ├── property-card.tsx     # Property listing card
│   ├── app-sidebar.tsx       # Dashboard sidebar
│   └── ...                   # Other components
├── lib/
│   ├── utils.ts              # Utility functions
│   └── mock-data.ts          # Sample property data
└── public/                   # Static assets
## Design System

### Colors

- **Primary**: Slate/Navy (`#0f172a`)
- **Accent**: Blue (`#3b82f6`)
- **Success**: Emerald (`#10b981`)
- **Background**: Off-white (`#f8fafc`)


### Typography

- **Font**: Geist Sans
- **Headings**: Bold, tight letter-spacing
- **Body**: Regular, relaxed line-height


### Animations

- Smooth scroll-triggered animations
- Cubic-bezier easing (0.22, 1, 0.36, 1)
- Staggered delays for list items
- Hover lift effects on cards


## Key Concepts

### Tokenization

Properties are divided into tokens representing fractional ownership. Each token:

- Represents a proportional share of the property
- Entitles holder to rental income distributions
- Grants voting rights on property decisions
- Can be traded on the secondary marketplace


### Investment Process

1. Complete KYC verification
2. Browse available properties
3. Purchase tokens (min ₹5,000)
4. Receive rental income monthly
5. Trade or hold tokens


### Property Onboarding

1. Basic property details
2. Document upload (7/12 extract, title deed, etc.)
3. Property valuation
4. Token configuration
5. Legal agreement signing
6. Final review and submission

This README covers the full scope of your platform including all pages, features, tech stack, and project structure. Would you like me to add this as an actual README.md file to your project?

## License

Private - All rights reserved
