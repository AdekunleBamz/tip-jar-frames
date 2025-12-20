'use client';

import { useState, useEffect } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, type Address, encodeFunctionData } from 'viem';
import { DEFAULT_TIP_AMOUNTS, TIPJAR_ADDRESS } from '@/lib/constants';
import { TIPJAR_ABI } from '@/lib/abi';

interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  walletAddress: string;
  verifiedAddresses: string[];
}

export function SendTip() {
  const { address: connectedAddress } = useAccount();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<FarcasterUser | null>(null);
  const [searchError, setSearchError] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(DEFAULT_TIP_AMOUNTS[1]);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customAmount, setCustomAmount] = useState('0.01');
  const [tipSuccess, setTipSuccess] = useState(false);

  const { sendTransaction, data: txHash, isPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Handle transaction success
  useEffect(() => {
    if (isSuccess) {
      setTipSuccess(true);
      setShowCustomModal(false);
      setTimeout(() => setTipSuccess(false), 5000);
    }
  }, [isSuccess]);

  const searchUser = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchError('');
    setSearchResult(null);

    try {
      // Remove @ if present
      const username = searchQuery.trim().replace(/^@/, '');
      const response = await fetch(`/api/user?username=${encodeURIComponent(username)}`);
      
      if (!response.ok) {
        const data = await response.json();
        setSearchError(data.error || 'User not found');
        return;
      }

      const user = await response.json();
      setSearchResult(user);
    } catch (error) {
      setSearchError('Failed to search user');
    } finally {
      setIsSearching(false);
    }
  };

  const handleTip = async (amount: string) => {
    if (!connectedAddress || !searchResult) return;

    try {
      const data = encodeFunctionData({
        abi: TIPJAR_ABI,
        functionName: 'tip',
        args: [searchResult.walletAddress as Address],
      });

      sendTransaction({
        to: TIPJAR_ADDRESS as Address,
        data,
        value: parseEther(amount),
      });
    } catch (error) {
      console.error('Tip failed:', error);
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
    <div className="space-y-4">
      {/* Search Input */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Search Farcaster Username
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">@</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchUser()}
              placeholder="username"
              className="input pl-8 text-sm"
            />
          </div>
          <button
            onClick={searchUser}
            disabled={isSearching || !searchQuery.trim()}
            className="btn-primary px-4 text-sm disabled:opacity-50"
          >
            {isSearching ? '...' : 'Search'}
          </button>
        </div>
        {searchError && (
          <p className="text-red-400 text-sm mt-2">{searchError}</p>
        )}
      </div>

      {/* Search Result / User Card */}
      {searchResult && (
        <div className="bg-[var(--color-surface-light)] rounded-xl p-4 border border-purple-500/30">
          <div className="flex items-center gap-3 mb-4">
            {searchResult.avatar ? (
              <img
                src={searchResult.avatar}
                alt={searchResult.displayName}
                className="w-14 h-14 rounded-full border-2 border-purple-500"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                💜
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-bold text-lg truncate">{searchResult.displayName}</div>
              <div className="text-slate-400 text-sm">@{searchResult.username}</div>
            </div>
          </div>

          {searchResult.bio && (
            <p className="text-slate-300 text-sm mb-4 line-clamp-2">{searchResult.bio}</p>
          )}

          <div className="text-xs text-slate-500 mb-4 truncate">
            Wallet: {searchResult.walletAddress.slice(0, 10)}...{searchResult.walletAddress.slice(-8)}
          </div>

          {/* Tip Amount Selection */}
          <div className="mb-4">
            <div className="text-sm text-slate-300 mb-2">Select Tip Amount</div>
            <div className="grid grid-cols-4 gap-2">
              {DEFAULT_TIP_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setSelectedAmount(amount)}
                  className={`tip-btn text-xs py-2 ${selectedAmount === amount ? 'selected' : ''}`}
                >
                  {amount} ETH
                </button>
              ))}
            </div>
          </div>

          {/* Tip Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleTip(String(selectedAmount))}
              disabled={isPending || isConfirming}
              className="btn-primary text-sm py-3 disabled:opacity-50"
            >
              {isPending ? 'Confirm...' : isConfirming ? 'Sending...' : `Tip ${selectedAmount} ETH`}
            </button>
            <button
              onClick={() => setShowCustomModal(true)}
              disabled={isPending || isConfirming}
              className="btn-secondary text-sm py-3 disabled:opacity-50"
            >
              Custom 💜
            </button>
          </div>

          {/* Success Message */}
          {tipSuccess && (
            <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-center">
              <span className="text-green-400">✓ Tip sent successfully to @{searchResult.username}!</span>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!searchResult && !searchError && (
        <div className="bg-[var(--color-surface-light)] rounded-xl p-6 text-center border border-white/10">
          <div className="text-4xl mb-3">🔍</div>
          <div className="text-slate-400 text-sm">
            Search for any Farcaster user to send them a tip
          </div>
        </div>
      )}

      {/* Custom Amount Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2">Custom Tip Amount</h3>
            <p className="text-slate-400 text-sm mb-4">
              Sending to @{searchResult?.username}
            </p>
            <div className="mb-4">
              <label className="block text-sm text-slate-300 mb-2">Amount in ETH</label>
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
    </div>
  );
}
