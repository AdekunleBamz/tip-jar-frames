import { createPublicClient, http, formatEther, type Address } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { TIPJAR_ABI } from './abi';
import { TIPJAR_ADDRESS, ACTIVE_CHAIN_ID, BASE_CHAIN_ID } from './constants';

// Create public client for Base
const chain = ACTIVE_CHAIN_ID === BASE_CHAIN_ID ? base : baseSepolia;

export const publicClient = createPublicClient({
  chain,
  transport: http(),
});

export interface CreatorStats {
  totalTips: string;
  tipCount: number;
  totalTipsWei: bigint;
}

export interface TipEvent {
  tipId: bigint;
  sender: Address;
  recipient: Address;
  amount: bigint;
  fee: bigint;
  timestamp: bigint;
  transactionHash: string;
}

/**
 * Get creator stats from the contract
 */
export async function getCreatorStats(creatorAddress: Address): Promise<CreatorStats> {
  if (!TIPJAR_ADDRESS) {
    return { totalTips: '0', tipCount: 0, totalTipsWei: 0n };
  }

  try {
    const [total, count] = await publicClient.readContract({
      address: TIPJAR_ADDRESS as Address,
      abi: TIPJAR_ABI,
      functionName: 'getCreatorStats',
      args: [creatorAddress],
    });

    return {
      totalTips: formatEther(total),
      tipCount: Number(count),
      totalTipsWei: total,
    };
  } catch (error) {
    console.error('Error fetching creator stats:', error);
    return { totalTips: '0', tipCount: 0, totalTipsWei: 0n };
  }
}

/**
 * Get recent tips for a creator from contract events
 */
export async function getRecentTips(
  creatorAddress: Address,
  limit: number = 5
): Promise<TipEvent[]> {
  if (!TIPJAR_ADDRESS) {
    return [];
  }

  try {
    const currentBlock = await publicClient.getBlockNumber();
    // Look back ~7 days on Base (2 second blocks)
    const fromBlock = currentBlock - BigInt(302400);

    const logs = await publicClient.getLogs({
      address: TIPJAR_ADDRESS as Address,
      event: {
        type: 'event',
        name: 'TipSent',
        inputs: [
          { indexed: true, name: 'tipId', type: 'uint256' },
          { indexed: true, name: 'sender', type: 'address' },
          { indexed: true, name: 'recipient', type: 'address' },
          { indexed: false, name: 'amount', type: 'uint256' },
          { indexed: false, name: 'fee', type: 'uint256' },
          { indexed: false, name: 'timestamp', type: 'uint256' },
        ],
      },
      args: {
        recipient: creatorAddress,
      },
      fromBlock: fromBlock > 0n ? fromBlock : 0n,
      toBlock: 'latest',
    });

    return logs
      .slice(-limit)
      .reverse()
      .map((log) => ({
        tipId: log.args.tipId!,
        sender: log.args.sender!,
        recipient: log.args.recipient!,
        amount: log.args.amount!,
        fee: log.args.fee!,
        timestamp: log.args.timestamp!,
        transactionHash: log.transactionHash,
      }));
  } catch (error) {
    console.error('Error fetching recent tips:', error);
    return [];
  }
}

/**
 * Calculate fee breakdown for a tip amount
 */
export function calculateTipBreakdown(amountEth: number): {
  grossAmount: string;
  fee: string;
  creatorReceives: string;
} {
  const grossWei = BigInt(Math.floor(amountEth * 1e18));
  const feeWei = (grossWei * 200n) / 10000n;
  const creatorWei = grossWei - feeWei;

  return {
    grossAmount: formatEther(grossWei),
    fee: formatEther(feeWei),
    creatorReceives: formatEther(creatorWei),
  };
}

/**
 * Format address for display
 */
export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Format ETH amount for display
 */
export function formatEthDisplay(amount: string | bigint, decimals = 4): string {
  const value = typeof amount === 'bigint' ? formatEther(amount) : amount;
  const num = parseFloat(value);
  if (num === 0) return '0 ETH';
  if (num < 0.0001) return '<0.0001 ETH';
  return `${num.toFixed(decimals)} ETH`;
}
