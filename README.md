# 💜 Tip Jar Frames

[![CI](https://github.com/AdekunleBamz/tip-jar-frames/actions/workflows/ci.yml/badge.svg)](https://github.com/AdekunleBamz/tip-jar-frames/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Base](https://img.shields.io/badge/Built%20on-Base-blue.svg)](https://base.org/)

Social-native tipping system for Farcaster creators on Base.

## Overview

Tip Jar Frames lets Farcaster creators receive tips directly in the feed using Frames. No external links, no friction - just seamless in-app tipping.

### Features

- **Zero Friction**: Tip creators without leaving Farcaster
- **Built on Base**: Low fees, fast transactions
- **Instant Payments**: Tips go directly to creator wallets
- **Transparent Fees**: 2% protocol fee, no hidden costs
- **Customizable**: Set your name, avatar, and tip amounts
- **Social Native**: Designed for Farcaster

## Tech Stack

- **Frontend**: Next.js 14, React, TailwindCSS
- **Wallet**: wagmi v2, ConnectKit
- **Blockchain**: Base (Ethereum L2)
- **Smart Contract**: Solidity 0.8.24, Hardhat
- **Frame Protocol**: Farcaster Frames vNext

## Project Structure

```
tip-jar-frames/
├── contracts/
│   └── TipJar.sol          # Main tipping contract
├── scripts/
│   └── deploy.ts           # Deployment script
├── src/
│   ├── app/
│   │   ├── api/frame/      # Frame API endpoints
│   │   │   ├── [address]/  # Frame metadata & interactions
│   │   │   ├── image/      # Dynamic OG image generation
│   │   │   └── tx/         # Transaction endpoint
│   │   ├── frame/[address]/ # Frame preview page
│   │   └── page.tsx        # Main app page
│   ├── components/         # React components
│   ├── indexer/            # Event indexer (optional)
│   └── lib/                # Utilities & configs
├── .env.example            # Environment template
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- A wallet with ETH on Base (for deployment)
- WalletConnect Project ID (free at [cloud.walletconnect.com](https://cloud.walletconnect.com))

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/tip-jar-frames.git
cd tip-jar-frames

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
```

### Configuration

Edit `.env.local` with your values:

```env
# Required for frontend
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Required for contract deployment
DEPLOYER_PRIVATE_KEY=your_private_key
PROTOCOL_FEE_RECIPIENT=your_address

# Optional: Farcaster profile enrichment
NEYNAR_API_KEY=your_neynar_key
```

### Development

```bash
# Run development server
npm run dev

# Open http://localhost:3000
```

## Contract Deployment

### Deploy to Base Sepolia (Testnet)

```bash
# Compile contract
npm run compile

# Deploy to testnet
npm run deploy baseSepolia

# Update .env.local with deployed address
NEXT_PUBLIC_TIPJAR_ADDRESS_TESTNET=0x...
```

### Deploy to Base Mainnet

```bash
# Deploy to mainnet
npm run deploy base

# Verify on Basescan
npx hardhat verify --network base <CONTRACT_ADDRESS> <FEE_RECIPIENT>

# Update .env.local
NEXT_PUBLIC_TIPJAR_ADDRESS_MAINNET=0x...
```

## Smart Contract

### TipJar.sol

The contract is minimal by design:

- **Immediate forwarding**: No withdrawal pattern needed
- **2% protocol fee**: Transparent, on-chain
- **Event-based**: Easy to index and track
- **Min tip**: 0.0001 ETH to prevent dust attacks

### Functions

- `tip(address recipient)` - Send a tip
- `tipWithMessage(address recipient, string message)` - Tip with a message
- `getCreatorStats(address creator)` - View stats
- `calculateFee(uint256 amount)` - Calculate fee breakdown

## Frame Protocol

### How Frames Work

1. User creates a Frame URL (e.g., `https://yourapp.com/frame/0x...`)
2. They paste it in a Farcaster cast
3. Farcaster clients render buttons from Frame metadata
4. Clicking a button triggers a transaction
5. Tips flow directly to the creator's wallet

### API Endpoints

- `GET /api/frame/[address]` - Frame metadata
- `POST /api/frame/[address]` - Button interactions
- `GET /api/frame/image?address=...` - Dynamic OG image
- `POST /api/frame/tx?recipient=...&amount=...` - Transaction data

## Running the Indexer

The indexer watches for TipSent events and stores them locally:

```bash
# Set up indexer environment
TIPJAR_ADDRESS=0x...  # Your deployed contract

# Run indexer
npm run index
```

## Production Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

```env
NEXT_PUBLIC_TIPJAR_ADDRESS_MAINNET=0x...
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...
NEYNAR_API_KEY=...
```

## Testing

### Linting

To check code quality:

```bash
npm run lint
```

This will run ESLint on the codebase.
```bash
# Run contract tests
npm run test

# Test Frame locally
# 1. Start dev server: npm run dev
# 2. Use Frame Validator: https://warpcast.com/~/developers/frames
```

## Contributing

1. Fork the repo
2. Create a feature branch
3. Make changes
4. Submit a PR

## License

MIT License - see [LICENSE](LICENSE) for details.

## Links

- [Base](https://base.org) - Ethereum L2
- [Farcaster Frames](https://docs.farcaster.xyz/reference/frames/spec) - Frame specification
- [ConnectKit](https://docs.family.co/connectkit) - Wallet connection
- [Neynar](https://neynar.com) - Farcaster API

---

Built with 💜 on Base
