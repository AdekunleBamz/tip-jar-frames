'use client';

import { useState, useEffect } from 'react';
import { type Address } from 'viem';
import { APP_URL } from '@/lib/constants';
import { getCreatorStats, type CreatorStats } from '@/lib/contract';
import { useFarcaster } from './FarcasterProvider';

interface FrameGeneratorProps {
  address: string;
}

export function FrameGenerator({ address }: FrameGeneratorProps) {
  const { user } = useFarcaster();
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use Farcaster username from SDK context, or fetch from API
  useEffect(() => {
    const fetchUsername = async () => {
      // First try to use username from Farcaster SDK context
      if (user?.username) {
        setUsername(user.username);
        setIsLoading(false);
        return;
      }

      // Otherwise, look up username by wallet address
      try {
        const response = await fetch(`/api/user/by-address?address=${address}`);
        if (response.ok) {
          const data = await response.json();
          if (data.username) {
            setUsername(data.username);
          }
        }
      } catch (error) {
        console.error('Failed to fetch username:', error);
      }
      setIsLoading(false);
    };

    fetchUsername();
  }, [address, user]);

  // Fetch creator stats
  useEffect(() => {
    getCreatorStats(address as Address).then(setStats);
  }, [address]);

  // Use username in URL if available, otherwise fall back to address
  const frameUrl = username 
    ? `${APP_URL}/tip/${username}`
    : `${APP_URL}/frame/${address}`;
  
  const displayName = user?.displayName || username || `${address.slice(0, 6)}...${address.slice(-4)}`;

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
          {user?.pfpUrl ? (
            <img 
              src={user.pfpUrl} 
              alt={displayName}
              className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-purple-500"
            />
          ) : (
            <div className="w-16 h-16 rounded-full mx-auto mb-2 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
              💜
            </div>
          )}
          <div className="font-bold">{displayName}&apos;s Tip Jar</div>
          {username && (
            <div className="text-sm text-purple-400">@{username}</div>
          )}
          <div className="text-xs text-slate-400 mt-1">
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
            value={isLoading ? 'Loading...' : frameUrl}
            readOnly
            className="input flex-1 text-xs"
          />
          <button
            onClick={copyToClipboard}
            disabled={isLoading}
            className="btn-secondary text-xs whitespace-nowrap px-3 disabled:opacity-50"
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button 
          onClick={shareToWarpcast} 
          disabled={isLoading}
          className="btn-primary text-sm py-3 disabled:opacity-50"
        >
          Share on Warpcast 🚀
        </button>
        <button 
          onClick={copyToClipboard} 
          disabled={isLoading}
          className="btn-secondary text-sm py-3 disabled:opacity-50"
        >
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
