'use client';

import { useState, useEffect } from 'react';
import { useAccount, useChainId, useSwitchChain, useConnect, useDisconnect } from 'wagmi';
import { base } from 'viem/chains';
import { Header } from '@/components/Header';
import { FrameGenerator } from '@/components/FrameGenerator';
import { SendTip } from '@/components/SendTip';
import { HowItWorks } from '@/components/HowItWorks';
import { Features } from '@/components/Features';
import { Footer } from '@/components/Footer';
import { useFarcaster } from '@/components/FarcasterProvider';

type Tab = 'send' | 'receive';

export default function Home() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { isInFrame, isSDKLoaded } = useFarcaster();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('send');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-connect Farcaster wallet when in frame
  useEffect(() => {
    if (isSDKLoaded && isInFrame && !isConnected) {
      const farcasterConnector = connectors.find(c => c.id === 'farcasterFrame');
      if (farcasterConnector) {
        connect({ connector: farcasterConnector });
      }
    }
  }, [isSDKLoaded, isInFrame, isConnected, connectors, connect]);

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

  const handleConnect = () => {
    const farcasterConnector = connectors.find(c => c.id === 'farcasterFrame');
    const injectedConnector = connectors.find(c => c.id === 'injected');
    
    if (isInFrame && farcasterConnector) {
      connect({ connector: farcasterConnector });
    } else if (injectedConnector) {
      connect({ connector: injectedConnector });
    } else if (connectors[0]) {
      connect({ connector: connectors[0] });
    }
  };

  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-20 pb-8 px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="animate-float mb-4">
            <span className="text-5xl">💜</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="gradient-text">Tip Jar</span>
          </h1>
          <p className="text-base text-slate-400 mb-6">
            Tip any Farcaster creator instantly on Base
          </p>
          
          {!isConnected ? (
            <div className="flex flex-col items-center gap-3">
              <button 
                onClick={handleConnect}
                className="btn-primary text-base px-6 py-3"
              >
                Connect Wallet
              </button>
              <p className="text-slate-500 text-xs">
                Powered by Base • 2% protocol fee
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div className="text-slate-400 text-sm">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </div>
              <button 
                onClick={() => disconnect()}
                className="text-slate-500 text-xs hover:text-white transition"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Main Content with Tabs */}
      {isConnected && address && (
        <section className="px-4 pb-8">
          <div className="max-w-lg mx-auto">
            {/* Tab Buttons */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab('send')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all ${
                  activeTab === 'send'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-[var(--color-surface)] text-slate-400 hover:text-white'
                }`}
              >
                🎁 Send Tip
              </button>
              <button
                onClick={() => setActiveTab('receive')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all ${
                  activeTab === 'receive'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-[var(--color-surface)] text-slate-400 hover:text-white'
                }`}
              >
                💰 My Tip Jar
              </button>
            </div>

            {/* Tab Content */}
            <div className="card p-4">
              {activeTab === 'send' ? (
                <SendTip />
              ) : (
                <FrameGenerator address={address} />
              )}
            </div>
          </div>
        </section>
      )}

      {/* Info Cards for Non-Connected Users */}
      {!isConnected && (
        <>
          <HowItWorks />
          <Features />
        </>
      )}

      <Footer />
    </main>
  );
}
