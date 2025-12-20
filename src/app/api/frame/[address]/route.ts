import { NextRequest } from 'next/server';
import { isAddress, type Address } from 'viem';
import { getCreatorStats } from '@/lib/contract';
import { 
  generateFrameHtml, 
  getFrameImageUrl, 
  parseFrameState, 
  encodeFrameState,
  getTxTargetUrl 
} from '@/lib/frames';
import { APP_URL, DEFAULT_TIP_AMOUNTS } from '@/lib/constants';
import { getCreatorProfile } from '@/lib/profiles';

interface FrameRequest {
  untrustedData: {
    fid: number;
    url: string;
    messageHash: string;
    timestamp: number;
    network: number;
    buttonIndex: number;
    inputText?: string;
    castId: {
      fid: number;
      hash: string;
    };
  };
  trustedData?: {
    messageBytes: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  const creatorAddress = params.address;

  // Validate address
  if (!isAddress(creatorAddress)) {
    return new Response('Invalid address', { status: 400 });
  }

  // Get creator stats and profile
  const [stats, profile] = await Promise.all([
    getCreatorStats(creatorAddress as Address),
    getCreatorProfile(creatorAddress),
  ]);

  // Generate initial frame
  const imageUrl = getFrameImageUrl(creatorAddress, {
    name: profile.name,
    avatar: profile.avatar,
    totalTips: stats.totalTips,
    tipCount: stats.tipCount,
  });

  const frameHtml = generateFrameHtml({
    version: 'vNext',
    image: imageUrl,
    imageAspectRatio: '1.91:1',
    postUrl: `${APP_URL}/api/frame/${creatorAddress}`,
    buttons: [
      { label: `${DEFAULT_TIP_AMOUNTS[0]} ETH`, action: 'tx', target: getTxTargetUrl(creatorAddress, DEFAULT_TIP_AMOUNTS[0].toString()) },
      { label: `${DEFAULT_TIP_AMOUNTS[1]} ETH`, action: 'tx', target: getTxTargetUrl(creatorAddress, DEFAULT_TIP_AMOUNTS[1].toString()) },
      { label: `${DEFAULT_TIP_AMOUNTS[2]} ETH`, action: 'tx', target: getTxTargetUrl(creatorAddress, DEFAULT_TIP_AMOUNTS[2].toString()) },
      { label: 'Custom 💜', action: 'post' },
    ],
    state: encodeFrameState({ view: 'main' }),
  }, `Tip ${profile.name || creatorAddress}`);

  return new Response(frameHtml, {
    headers: { 'Content-Type': 'text/html' },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  const creatorAddress = params.address;

  if (!isAddress(creatorAddress)) {
    return new Response('Invalid address', { status: 400 });
  }

  let frameRequest: FrameRequest;
  try {
    frameRequest = await request.json();
  } catch {
    return new Response('Invalid request', { status: 400 });
  }

  const { buttonIndex, inputText } = frameRequest.untrustedData;
  const state = parseFrameState(frameRequest.untrustedData.url.split('state=')[1]);

  // Get creator info
  const [stats, profile] = await Promise.all([
    getCreatorStats(creatorAddress as Address),
    getCreatorProfile(creatorAddress),
  ]);

  // Handle different states
  if (state.view === 'custom' || buttonIndex === 4) {
    // Show custom amount input
    if (buttonIndex === 4 && state.view !== 'custom') {
      const imageUrl = getFrameImageUrl(creatorAddress, {
        name: profile.name,
        avatar: profile.avatar,
        totalTips: stats.totalTips,
        tipCount: stats.tipCount,
      });

      const frameHtml = generateFrameHtml({
        version: 'vNext',
        image: imageUrl,
        imageAspectRatio: '1.91:1',
        postUrl: `${APP_URL}/api/frame/${creatorAddress}`,
        input: { text: 'Enter ETH amount (e.g., 0.01)' },
        buttons: [
          { label: 'Send Tip 💜', action: 'post' },
          { label: '← Back', action: 'post' },
        ],
        state: encodeFrameState({ view: 'custom' }),
      }, `Tip ${profile.name || creatorAddress}`);

      return new Response(frameHtml, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Process custom amount
    if (buttonIndex === 1 && inputText) {
      const amount = parseFloat(inputText);
      if (isNaN(amount) || amount < 0.0001) {
        // Show error
        const imageUrl = getFrameImageUrl(creatorAddress, {
          name: profile.name,
          avatar: profile.avatar,
          state: 'error',
        });

        const frameHtml = generateFrameHtml({
          version: 'vNext',
          image: imageUrl,
          imageAspectRatio: '1.91:1',
          postUrl: `${APP_URL}/api/frame/${creatorAddress}`,
          buttons: [
            { label: 'Try Again', action: 'post' },
          ],
          state: encodeFrameState({ view: 'main' }),
        });

        return new Response(frameHtml, {
          headers: { 'Content-Type': 'text/html' },
        });
      }

      // Return transaction frame
      return new Response(JSON.stringify({
        chainId: 'eip155:8453',
        method: 'eth_sendTransaction',
        params: {
          to: process.env.NEXT_PUBLIC_TIPJAR_ADDRESS_MAINNET,
          data: encodeTipCalldata(creatorAddress),
          value: Math.floor(amount * 1e18).toString(16),
        },
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Back button - return to main view
    if (buttonIndex === 2) {
      const imageUrl = getFrameImageUrl(creatorAddress, {
        name: profile.name,
        avatar: profile.avatar,
        totalTips: stats.totalTips,
        tipCount: stats.tipCount,
      });

      const frameHtml = generateFrameHtml({
        version: 'vNext',
        image: imageUrl,
        imageAspectRatio: '1.91:1',
        postUrl: `${APP_URL}/api/frame/${creatorAddress}`,
        buttons: [
          { label: `${DEFAULT_TIP_AMOUNTS[0]} ETH`, action: 'tx', target: getTxTargetUrl(creatorAddress, DEFAULT_TIP_AMOUNTS[0].toString()) },
          { label: `${DEFAULT_TIP_AMOUNTS[1]} ETH`, action: 'tx', target: getTxTargetUrl(creatorAddress, DEFAULT_TIP_AMOUNTS[1].toString()) },
          { label: `${DEFAULT_TIP_AMOUNTS[2]} ETH`, action: 'tx', target: getTxTargetUrl(creatorAddress, DEFAULT_TIP_AMOUNTS[2].toString()) },
          { label: 'Custom 💜', action: 'post' },
        ],
        state: encodeFrameState({ view: 'main' }),
      }, `Tip ${profile.name || creatorAddress}`);

      return new Response(frameHtml, {
        headers: { 'Content-Type': 'text/html' },
      });
    }
  }

  // Default: show success state after transaction
  const imageUrl = getFrameImageUrl(creatorAddress, {
    name: profile.name,
    avatar: profile.avatar,
    totalTips: stats.totalTips,
    tipCount: stats.tipCount,
    state: 'success',
  });

  const frameHtml = generateFrameHtml({
    version: 'vNext',
    image: imageUrl,
    imageAspectRatio: '1.91:1',
    postUrl: `${APP_URL}/api/frame/${creatorAddress}`,
    buttons: [
      { label: 'Tip Again 💜', action: 'post' },
      { label: 'Share', action: 'link', target: `https://warpcast.com/~/compose?text=I%20just%20tipped%20${profile.name || creatorAddress}%20on%20@tipjar&embeds[]=${APP_URL}/frame/${creatorAddress}` },
    ],
    state: encodeFrameState({ view: 'success' }),
  }, `Tip ${profile.name || creatorAddress}`);

  return new Response(frameHtml, {
    headers: { 'Content-Type': 'text/html' },
  });
}

/**
 * Encode tip function calldata
 */
function encodeTipCalldata(recipient: string): string {
  // tip(address) function selector: 0xd9e256b9
  const selector = 'd9e256b9';
  const paddedAddress = recipient.slice(2).toLowerCase().padStart(64, '0');
  return `0x${selector}${paddedAddress}`;
}
