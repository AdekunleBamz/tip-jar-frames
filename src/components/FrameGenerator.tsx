'use client';

import { useState, useEffect } from 'react';
import { APP_URL, DEFAULT_TIP_AMOUNTS } from '@/lib/constants';
import { getCreatorStats, type CreatorStats } from '@/lib/contract';
import { type Address } from 'viem';

interface FrameGeneratorProps {
  address: string;
}

export function FrameGenerator({ address }: FrameGeneratorProps) {
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [defaultAmount, setDefaultAmount] = useState(DEFAULT_TIP_AMOUNTS[1]);
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
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="card p-8">
          <h2 className="text-2xl font-bold mb-6">Create Your Tip Jar Frame</h2>
          
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-[var(--color-surface-light)] rounded-xl p-4">
                <div className="text-3xl font-bold gradient-text">
                  {parseFloat(stats.totalTips).toFixed(4)} ETH
                </div>
                <div className="text-slate-400 text-sm">Total Received</div>
              </div>
              <div className="bg-[var(--color-surface-light)] rounded-xl p-4">
                <div className="text-3xl font-bold gradient-text">
                  {stats.tipCount}
                </div>
                <div className="text-slate-400 text-sm">Tips</div>
              </div>
            </div>
          )}

          {/* Customization Options */}
          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Display Name (optional)
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name or handle"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Avatar URL (optional)
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.png"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Default Tip Amount
              </label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_TIP_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setDefaultAmount(amount)}
                    className={`tip-btn ${defaultAmount === amount ? 'selected' : ''}`}
                  >
                    {amount} ETH
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Frame Preview */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Frame Preview
            </label>
            <div className="bg-[var(--color-surface-light)] rounded-xl p-4 border border-white/10">
              <div className="aspect-[1.91/1] bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Avatar" 
                      className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-purple-500"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full mx-auto mb-2 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                      💜
                    </div>
                  )}
                  <div className="text-lg font-bold">
                    {displayName || `${address.slice(0, 6)}...${address.slice(-4)}`}'s Tip Jar
                  </div>
                  <div className="text-sm text-slate-400">
                    {stats?.tipCount || 0} tips • {parseFloat(stats?.totalTips || '0').toFixed(4)} ETH
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                {DEFAULT_TIP_AMOUNTS.slice(0, 3).map((amount) => (
                  <button key={amount} className="flex-1 btn-secondary text-sm py-2">
                    {amount} ETH
                  </button>
                ))}
                <button className="flex-1 btn-secondary text-sm py-2">Custom 💜</button>
              </div>
            </div>
          </div>

          {/* Frame URL */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Your Frame URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={frameUrl}
                readOnly
                className="input flex-1"
              />
              <button
                onClick={copyToClipboard}
                className="btn-secondary whitespace-nowrap"
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={shareToWarpcast} className="btn-primary flex-1">
              Share on Warpcast 🚀
            </button>
            <button onClick={copyToClipboard} className="btn-secondary flex-1">
              Copy Frame URL
            </button>
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
            <p className="text-sm text-slate-300">
              <strong>💡 Tip:</strong> Paste your Frame URL into any Farcaster cast. 
              Your followers can tip you directly without leaving the feed!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
