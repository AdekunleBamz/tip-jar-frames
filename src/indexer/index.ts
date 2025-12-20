/**
 * TipJar Event Indexer
 * Listens for TipSent events and stores them in local database
 */

import { createPublicClient, http, parseAbiItem, type Address, formatEther } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import * as dotenv from 'dotenv';
import { 
  insertTip, 
  getLastBlockNumber, 
  setLastBlockNumber,
  getGlobalStats 
} from './database';

dotenv.config();

// Configuration
const USE_TESTNET = process.env.USE_TESTNET === 'true';
const TIPJAR_ADDRESS = process.env.TIPJAR_ADDRESS as Address | undefined;
const POLL_INTERVAL = 5000; // 5 seconds

if (!TIPJAR_ADDRESS) {
  console.error('❌ TIPJAR_ADDRESS not set in environment');
  process.exit(1);
}

// Create client
const chain = USE_TESTNET ? baseSepolia : base;
const rpcUrl = USE_TESTNET 
  ? process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'
  : process.env.BASE_RPC_URL || 'https://mainnet.base.org';

const client = createPublicClient({
  chain,
  transport: http(rpcUrl),
});

// Event ABIs
const tipSentEvent = parseAbiItem(
  'event TipSent(uint256 indexed tipId, address indexed sender, address indexed recipient, uint256 amount, uint256 fee, uint256 timestamp)'
);

const tipMessageEvent = parseAbiItem(
  'event TipMessage(uint256 indexed tipId, string message)'
);

// Store for tip messages (matched by tipId)
const messageCache = new Map<string, string>();

async function fetchTipMessages(fromBlock: bigint, toBlock: bigint): Promise<void> {
  try {
    const logs = await client.getLogs({
      address: TIPJAR_ADDRESS,
      event: tipMessageEvent,
      fromBlock,
      toBlock,
    });

    for (const log of logs) {
      if (log.args.tipId !== undefined && log.args.message !== undefined) {
        messageCache.set(log.args.tipId.toString(), log.args.message);
      }
    }
  } catch (error) {
    console.error('Error fetching tip messages:', error);
  }
}

async function processEvents(fromBlock: bigint, toBlock: bigint): Promise<number> {
  // First fetch any messages in this range
  await fetchTipMessages(fromBlock, toBlock);

  // Then fetch TipSent events
  const logs = await client.getLogs({
    address: TIPJAR_ADDRESS,
    event: tipSentEvent,
    fromBlock,
    toBlock,
  });

  let processedCount = 0;

  for (const log of logs) {
    const { tipId, sender, recipient, amount, fee, timestamp } = log.args;
    
    if (tipId === undefined || !sender || !recipient || amount === undefined || fee === undefined || timestamp === undefined) {
      continue;
    }

    const tipIdStr = tipId.toString();
    const message = messageCache.get(tipIdStr) || '';
    
    // Clear from cache after use
    messageCache.delete(tipIdStr);

    insertTip(
      tipIdStr,
      sender,
      recipient,
      amount,
      fee,
      message,
      log.transactionHash,
      Number(log.blockNumber),
      Number(timestamp)
    );

    console.log(`  💜 Tip #${tipIdStr}: ${formatEther(amount)} ETH from ${shortenAddress(sender)} to ${shortenAddress(recipient)}`);
    processedCount++;
  }

  return processedCount;
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

async function runIndexer(): Promise<void> {
  console.log('🚀 TipJar Indexer Starting...');
  console.log(`   Network: ${chain.name}`);
  console.log(`   Contract: ${TIPJAR_ADDRESS}`);
  console.log(`   RPC: ${rpcUrl}`);
  console.log('');

  let lastBlock = getLastBlockNumber();
  
  // If no last block, start from current block - 10000 (approx 5.5 hours on Base)
  if (lastBlock === 0) {
    const currentBlock = await client.getBlockNumber();
    lastBlock = Number(currentBlock) - 10000;
    console.log(`📍 Starting from block ${lastBlock} (no previous checkpoint)`);
  } else {
    console.log(`📍 Resuming from block ${lastBlock}`);
  }

  // Print current stats
  const stats = getGlobalStats();
  console.log(`📊 Current stats: ${stats.totalTips} tips, ${formatEther(stats.totalVolume)} ETH volume`);
  console.log('');
  console.log('👀 Watching for new tips...');
  console.log('');

  // Main loop
  while (true) {
    try {
      const currentBlock = await client.getBlockNumber();
      const toBlock = Number(currentBlock);

      if (toBlock > lastBlock) {
        const fromBlock = BigInt(lastBlock + 1);
        const processedCount = await processEvents(fromBlock, BigInt(toBlock));
        
        if (processedCount > 0) {
          console.log(`✅ Processed ${processedCount} tips in blocks ${lastBlock + 1} - ${toBlock}`);
        }

        lastBlock = toBlock;
        setLastBlockNumber(toBlock);
      }
    } catch (error) {
      console.error('Error in indexer loop:', error);
    }

    await sleep(POLL_INTERVAL);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down indexer...');
  const stats = getGlobalStats();
  console.log(`📊 Final stats: ${stats.totalTips} tips indexed`);
  process.exit(0);
});

// Run
runIndexer().catch(console.error);
