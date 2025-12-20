'use client';

import { useState, useEffect } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { ConnectKitButton } from 'connectkit';
import { base } from 'viem/chains';
import { Header } from '@/components/Header';
import { FrameGenerator } from '@/components/FrameGenerator';
import { HowItWorks } from '@/components/HowItWorks';
import { Features } from '@/components/Features';
import { Footer } from '@/components/Footer';

export default function Home() {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Switch to Base if on wrong network
  useEffect(() => {
    if (isConnected && chainId !== base.id) {
      switchChain?.({ chainId: base.id });
    }
  }, [isConnected, chainId, switchChain]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-glow w-16 h-16 rounded-full bg-purple-500/20" />
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-float mb-8">
            <span className="text-7xl">💜</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">Tip Jar</span> Frames
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Social-native tipping for Farcaster creators. 
            Receive tips without leaving the feed.
          </p>
          
          {!isConnected ? (
            <div className="flex flex-col items-center gap-4">
              <ConnectKitButton.Custom>
                {({ show }) => (
                  <button onClick={show} className="btn-primary text-lg px-8 py-4">
                    Connect Wallet to Create Your Tip Jar
                  </button>
                )}
              </ConnectKitButton.Custom>
              <p className="text-slate-500 text-sm">
                Powered by Base • 2% protocol fee
              </p>
            </div>
          ) : (
            <div className="text-slate-400">
              Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      {isConnected && address ? (
        <FrameGenerator address={address} />
      ) : (
        <>
          <HowItWorks />
          <Features />
        </>
      )}

      <Footer />
    </main>
  );
}
