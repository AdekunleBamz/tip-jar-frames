import type { Metadata } from 'next';
import { Providers } from '@/components/Providers';
import '@/styles/globals.css';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: 'Tip Jar Frames - Social Tipping for Farcaster',
  description: 'Create your personal tip jar and receive tips directly on Farcaster. Zero friction, instant payments on Base.',
  openGraph: {
    title: 'Tip Jar Frames',
    description: 'Create your personal tip jar for Farcaster',
    images: ['/og-image.svg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tip Jar Frames',
    description: 'Create your personal tip jar for Farcaster',
    images: ['/og-image.svg'],
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  other: {
    'fc:frame': JSON.stringify({
      version: "next",
      imageUrl: `${appUrl}/og-image.svg`,
      button: {
        title: "Create Tip Jar",
        action: {
          type: "launch_frame",
          name: "Tip Jar",
          url: appUrl,
          splashImageUrl: `${appUrl}/og-image.svg`,
          splashBackgroundColor: "#0F0F1A"
        }
      }
    })
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="fc:frame" content={JSON.stringify({
          version: "next",
          imageUrl: `${appUrl}/og-image.svg`,
          button: {
            title: "Create Tip Jar",
            action: {
              type: "launch_frame",
              name: "Tip Jar",
              url: appUrl,
              splashImageUrl: `${appUrl}/og-image.svg`,
              splashBackgroundColor: "#0F0F1A"
            }
          }
        })} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
