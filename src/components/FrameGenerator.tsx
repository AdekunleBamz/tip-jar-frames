'use client';

import { useState, useEffect } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, type Address, encodeFunctionData } from 'viem';
import { APP_URL, DEFAULT_TIP_AMOUNTS, TIPJAR_ADDRESS } from '@/lib/constants';
import { getCreatorStats, type CreatorStats } from '@/lib/contract';
import { TIPJAR_ABI } from '@/lib/abi';

interface FrameGeneratorProps {
  address: string;
}

export function FrameGenerator({ address }: FrameGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<CreatorStats | null>(null);
  
  const frameUrl = `${APP_URL}/frame/${address}`;

  // Fetch creator stats
  useEffect(() => {
    getCreatorStats(address as Address).then(setStats);
  }, [address]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(frameUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToWarpcast = () => {
    const text = encodeURIComponent(
      `Support me with a tip! 💜\n\nPowered by @tipjar`
    );
    const embedUrl = encodeURIComponent(frameUrl);
    window.open(
      `https://warpcast.com/~/compose?text=${text}&embeds[]=${embedUrl}`,
      '_blank'
    );
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[var(--color-surface-light)] rounded-xl p-3 text-center">
            <div className="text-xl font-bold gradient-text">
              {parseFloat(stats.totalTips).toFixed(4)}
            </div>
            <div className="text-slate-400 text-xs">ETH Received</div>
          </div>
          <div className="bg-[var(--color-surface-light)] rounded-xl p-3 text-center">
            <div className="text-xl font-bold gradient-text">
              {stats.tipCount}
            </div>
            <div className="text-slate-400 text-xs">Total Tips</div>
          </div>
        </div>
      )}

      {/* Tip Jar Preview */}
      <div className="bg-[var(--color-surface-light)] rounded-xl p-4 border border-white/10">
        <div className="text-center mb-3">
          <div className="w-16 h-16 rounded-full mx-auto mb-2 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
            💜
          </div>
          <div className="font-bold">
            {address.slice(0, 6)}...{address.slice(-4)}&apos;s Tip Jar
          </div>
          <div className="text-xs text-slate-400">
            Share this link to receive tips!
          </div>
        </div>
      </div>

      {/* Frame URL */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Your Tip Jar Link
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={frameUrl}
            readOnly
            className="input flex-1 text-xs"
          />
          <button
            onClick={copyToClipboard}
            className="btn-secondary text-xs whitespace-nowrap px-3"
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button onClick={shareToWarpcast} className="btn-primary text-sm py-3">
          Share on Warpcast 🚀
        </button>
        <button onClick={copyToClipboard} className="btn-secondary text-sm py-3">
          Copy Link
        </button>
      </div>

      {/* Info */}
      <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
        <p className="text-xs text-slate-300">
          <strong>💡 How it works:</strong> Share your tip jar link on Farcaster. 
          Others can tip you directly from their feed!
        </p>
      </div>
    </div>
  );
}
