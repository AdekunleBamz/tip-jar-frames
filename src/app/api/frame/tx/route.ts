import { NextRequest, NextResponse } from 'next/server';
import { isAddress } from 'viem';
import { TIPJAR_ADDRESS, ACTIVE_CHAIN_ID, BASE_CHAIN_ID } from '@/lib/constants';

/**
 * Transaction endpoint for Farcaster Frames
 * Returns transaction data for the tip action
 */
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const recipient = searchParams.get('recipient');
  const amount = searchParams.get('amount');

  if (!recipient || !isAddress(recipient)) {
    return NextResponse.json({ error: 'Invalid recipient' }, { status: 400 });
  }

  if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) < 0.0001) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }

  if (!TIPJAR_ADDRESS) {
    return NextResponse.json({ error: 'Contract not deployed' }, { status: 500 });
  }

  // Calculate value in wei (as hex)
  const valueWei = BigInt(Math.floor(parseFloat(amount) * 1e18));
  const valueHex = '0x' + valueWei.toString(16);

  // Encode tip(address) function call
  const selector = 'd9e256b9'; // keccak256("tip(address)")[:4]
  const paddedAddress = recipient.slice(2).toLowerCase().padStart(64, '0');
  const calldata = `0x${selector}${paddedAddress}`;

  // Return transaction data in Farcaster Frame format
  const chainId = ACTIVE_CHAIN_ID === BASE_CHAIN_ID ? 'eip155:8453' : 'eip155:84532';

  return NextResponse.json({
    chainId,
    method: 'eth_sendTransaction',
    params: {
      abi: [
        {
          inputs: [{ name: 'recipient', type: 'address' }],
          name: 'tip',
          outputs: [],
          stateMutability: 'payable',
          type: 'function',
        },
      ],
      to: TIPJAR_ADDRESS,
      data: calldata,
      value: valueHex,
    },
  });
}

export async function GET(request: NextRequest) {
  // GET requests show transaction info
  const { searchParams } = new URL(request.url);
  const recipient = searchParams.get('recipient');
  const amount = searchParams.get('amount');

  return NextResponse.json({
    recipient,
    amount,
    contract: TIPJAR_ADDRESS,
    chainId: ACTIVE_CHAIN_ID,
    fee: '2%',
  });
}
