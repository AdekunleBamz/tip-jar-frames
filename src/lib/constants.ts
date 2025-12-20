// Base Chain Configuration
export const BASE_CHAIN_ID = 8453;
export const BASE_SEPOLIA_CHAIN_ID = 84532;

// Use testnet for development, mainnet for production
export const ACTIVE_CHAIN_ID = process.env.NEXT_PUBLIC_USE_TESTNET === 'true' 
  ? BASE_SEPOLIA_CHAIN_ID 
  : BASE_CHAIN_ID;

export const CHAIN_CONFIG = {
  [BASE_CHAIN_ID]: {
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  [BASE_SEPOLIA_CHAIN_ID]: {
    name: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org',
    blockExplorer: 'https://sepolia.basescan.org',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
} as const;

// Contract addresses - update after deployment
export const CONTRACT_ADDRESSES = {
  [BASE_CHAIN_ID]: process.env.NEXT_PUBLIC_TIPJAR_ADDRESS_MAINNET || '',
  [BASE_SEPOLIA_CHAIN_ID]: process.env.NEXT_PUBLIC_TIPJAR_ADDRESS_TESTNET || '',
} as const;

export const TIPJAR_ADDRESS = CONTRACT_ADDRESSES[ACTIVE_CHAIN_ID];

// App configuration
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
export const APP_NAME = 'Tip Jar Frames';
export const APP_DESCRIPTION = 'Social-native tipping for Farcaster creators';

// Default tip amounts in ETH
export const DEFAULT_TIP_AMOUNTS = [0.001, 0.005, 0.01, 0.05];

// Protocol fee (for display purposes - enforced on-chain)
export const PROTOCOL_FEE_PERCENT = 2;

// Minimum tip amount
export const MIN_TIP_AMOUNT = 0.0001;

// Farcaster Hub URL
export const FARCASTER_HUB_URL = process.env.FARCASTER_HUB_URL || 'https://nemes.farcaster.xyz:2281';

// Neynar API
export const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || '';
