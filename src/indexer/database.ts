// Simple JSON file-based storage for MVP
// Replace with PostgreSQL/SQLite for production

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const TIPS_FILE = join(DATA_DIR, 'tips.json');

interface Tip {
  tipId: string;
  sender: string;
  recipient: string;
  amount: string;
  fee: string;
  message: string;
  txHash: string;
  blockNumber: number;
  timestamp: number;
}

interface TipsData {
  tips: Tip[];
  lastBlockNumber: number;
}

function ensureDataDir(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadData(): TipsData {
  ensureDataDir();
  if (!existsSync(TIPS_FILE)) {
    return { tips: [], lastBlockNumber: 0 };
  }
  try {
    const data = readFileSync(TIPS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { tips: [], lastBlockNumber: 0 };
  }
}

function saveData(data: TipsData): void {
  ensureDataDir();
  writeFileSync(TIPS_FILE, JSON.stringify(data, null, 2));
}

export function insertTip(
  tipId: string,
  sender: string,
  recipient: string,
  amount: bigint,
  fee: bigint,
  message: string,
  txHash: string,
  blockNumber: number,
  timestamp: number
): void {
  const data = loadData();
  
  // Check if tip already exists
  const exists = data.tips.some(t => t.tipId === tipId);
  if (exists) return;
  
  data.tips.push({
    tipId,
    sender: sender.toLowerCase(),
    recipient: recipient.toLowerCase(),
    amount: amount.toString(),
    fee: fee.toString(),
    message,
    txHash,
    blockNumber,
    timestamp
  });
  
  saveData(data);
}

export function getTipsByRecipient(recipient: string, limit = 50): Tip[] {
  const data = loadData();
  return data.tips
    .filter(t => t.recipient === recipient.toLowerCase())
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

export function getTipsBySender(sender: string, limit = 50): Tip[] {
  const data = loadData();
  return data.tips
    .filter(t => t.sender === sender.toLowerCase())
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

export function getCreatorStats(address: string): {
  totalTips: number;
  totalReceived: bigint;
  uniqueSupporters: number;
} {
  const data = loadData();
  const tips = data.tips.filter(t => t.recipient === address.toLowerCase());
  
  const uniqueSenders = new Set(tips.map(t => t.sender));
  const totalReceived = tips.reduce((sum, t) => sum + BigInt(t.amount), BigInt(0));
  
  return {
    totalTips: tips.length,
    totalReceived,
    uniqueSupporters: uniqueSenders.size
  };
}

export function getGlobalStats(): {
  totalTips: number;
  totalVolume: bigint;
  totalFees: bigint;
  uniqueCreators: number;
  uniqueTippers: number;
} {
  const data = loadData();
  
  const uniqueRecipients = new Set(data.tips.map(t => t.recipient));
  const uniqueSenders = new Set(data.tips.map(t => t.sender));
  const totalVolume = data.tips.reduce((sum, t) => sum + BigInt(t.amount), BigInt(0));
  const totalFees = data.tips.reduce((sum, t) => sum + BigInt(t.fee), BigInt(0));
  
  return {
    totalTips: data.tips.length,
    totalVolume,
    totalFees,
    uniqueCreators: uniqueRecipients.size,
    uniqueTippers: uniqueSenders.size
  };
}

export function getLastBlockNumber(): number {
  const data = loadData();
  return data.lastBlockNumber;
}

export function setLastBlockNumber(blockNumber: number): void {
  const data = loadData();
  data.lastBlockNumber = blockNumber;
  saveData(data);
}

export function getRecentTips(limit = 20): Tip[] {
  const data = loadData();
  return data.tips
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}
