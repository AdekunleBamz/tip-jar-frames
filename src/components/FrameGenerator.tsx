'use client';

import { useState, useEffect } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, type Address, encodeFunctionData } from 'viem';
import { APP_URL, DEFAULT_TIP_AMOUNTS, TIPJAR_ADDRESS } from '@/lib/constants';
import { getCreatorStats, type CreatorStats} from '@/lib/contract';
import { TIPJAR_ABI } from '@/lib/abi';

interface FrameGeneratorProps {
  address: string;
}

export function FrameGenerator({ address }: FrameGeneratorProps) {
  const { address: connectedAddress } = useAccount();
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [defaultAmount, setDefaultAmount] = useState(DEFAULT_TIP_AMOUNTS[1]);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customAmount, setCustomAmount] = useState('0.01');
  const [isTipping, setIsTipping] = useState(false);
  const [tipSuccess, setTipSuccess] = useState(false);
  
  const { sendTransaction, data: txHash, isPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const frameUrl = `${APP_URL}/frame/${address}`;

  // Fetch creator stats
  useEffect(() => {
    getCreatorStats(address as Address).then(setStats);
  }, [address]);

  // Handle transaction success
  useEffect(() => {
    if (isSuccess) {
      setTipSuccess(true);
      setIsTipping(false);
      setShowCustomModal(false);
      // Refresh stats
      getCreatorStats(address as Address).then(setStats);
      setTimeout(() => setTipSuccess(false), 3000);
    }
  }, [isSuccess, address]);

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

  const handleTip = async (amount: string) => {
    if (!connectedAddress) return;
    
    setIsTipping(true);
    try {
      const data = encodeFunctionData({
        abi: TIPJAR_ABI,
        functionName: 'tip',
        args: [address as Address],
      });

      sendTransaction({
        to: TIPJAR_ADDRESS as Address,
        data,
        value: parseEther(amount),
      });
    } catch (error) {
      console.error('Tip failed:', error);
      setIsTipping(false);
    }
  };

  const handleCustomTip = () => {
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    handleTip(customAmount);
  };

  return (
    <section className="py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="card p-6">
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-[var(--color-surface-light)] rounded-xl p-3">
                <div className="text-2xl font-bold gradient-text">
                  {parseFloat(stats.totalTips).toFixed(4)} ETH
                </div>
                <div className="text-slate-400 text-xs">Total Received</div>
              </div>
              <div className="bg-[var(--color-surface-light)] rounded-xl p-3">
                <div className="text-2xl font-bold gradient-text">
                  {stats.tipCount}
                </div>
                <div className="text-slate-400 text-xs">Tips</div>
              </div>
            </div>
          )}

          {/* Customization Options */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Display Name (optional)
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name or handle"
                className="input text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Avatar URL (optional)
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.png"
                className="input text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Default Tip Amount
              </label>
              <div className="grid grid-cols-4 gap-2">
                {DEFAULT_TIP_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setDefaultAmount(amount)}
                    className={`tip-btn text-xs py-2 ${defaultAmount === amount ? 'selected' : ''}`}
                  >
                    {amount} ETH
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Frame Preview */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Frame Preview
            </label>
            <div className="bg-[var(--color-surface-light)] rounded-xl p-3 border border-white/10">
              <div className="aspect-[1.91/1] bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg flex items-center justify-center mb-3">
                <div className="text-center">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Avatar" 
                      className="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-purple-500"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full mx-auto mb-2 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl">
                      💜
                    </div>
                  )}
                  <div className="text-sm font-bold">
                    {displayName || `${address.slice(0, 6)}...${address.slice(-4)}`}&apos;s Tip Jar
                  </div>
                  <div className="text-xs text-slate-400">
                    {stats?.tipCount || 0} tips • {parseFloat(stats?.totalTips || '0').toFixed(4)} ETH
                  </div>
                </div>
              </div>
              
              {/* Tip Buttons - Functional */}
              <div className="grid grid-cols-4 gap-2">
                {DEFAULT_TIP_AMOUNTS.slice(0, 3).map((amount) => (
                  <button 
                    key={amount} 
                    onClick={() => handleTip(String(amount))}
                    disabled={isPending || isConfirming || isTipping}
                    className="btn-secondary text-xs py-2 px-1 disabled:opacity-50"
                  >
                    {amount}<br/>ETH
                  </button>
                ))}
                <button 
                  onClick={() => setShowCustomModal(true)}
                  disabled={isPending || isConfirming || isTipping}
                  className="btn-secondary text-xs py-2 px-1 disabled:opacity-50"
                >
                  Custom<br/>💜
                </button>
              </div>

              {/* Transaction Status */}
              {(isPending || isConfirming) && (
                <div className="mt-3 text-center text-sm text-purple-400">
                  {isPending ? 'Confirm in wallet...' : 'Processing...'}
                </div>
              )}
              {tipSuccess && (
                <div className="mt-3 text-center text-sm text-green-400">
                  ✓ Tip sent successfully!
                </div>
              )}
            </div>
          </div>

          {/* Frame URL */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Your Frame URL
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
                {copied ? '✓' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={shareToWarpcast} className="btn-primary text-sm py-2">
              Share ��
            </button>
            <button onClick={copyToClipboard} className="btn-secondary text-sm py-2">
              Copy URL
            </button>
          </div>
        </div>
      </div>

      {/* Custom Amount Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Custom Tip Amount</h3>
            <div className="mb-4">
              <label className="block text-sm text-slate-300 mb-2">
                Amount in ETH
              </label>
              <input
                type="number"
                step="0.001"
                min="0.0001"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="0.01"
                className="input text-lg"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowCustomModal(false)}
                className="btn-secondary"
                disabled={isPending || isConfirming}
              >
                Cancel
              </button>
              <button
                onClick={handleCustomTip}
                className="btn-primary"
                disabled={isPending || isConfirming}
              >
                {isPending || isConfirming ? 'Sending...' : 'Send Tip 💜'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
