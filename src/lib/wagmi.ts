import { http, createConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    injected(),
    coinbaseWallet({
      appName: 'Tip Jar Frames',
    }),
    walletConnect({
      projectId: walletConnectProjectId,
      metadata: {
        name: 'Tip Jar Frames',
        description: 'Social-native tipping for Farcaster creators',
        url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        icons: ['/icon.svg'],
      },
    }),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});
