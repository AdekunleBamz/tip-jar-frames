import { Metadata } from 'next';
import { isAddress, type Address } from 'viem';
import { getCreatorStats } from '@/lib/contract';
import { getCreatorProfile } from '@/lib/profiles';
import { APP_URL, DEFAULT_TIP_AMOUNTS } from '@/lib/constants';

interface Props {
  params: { address: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { address } = params;
  
  if (!isAddress(address)) {
    return { title: 'Invalid Address - Tip Jar Frames' };
  }

  const [stats, profile] = await Promise.all([
    getCreatorStats(address as Address),
    getCreatorProfile(address),
  ]);

  const title = `Tip ${profile.name || address}`;
  const description = `Send a tip to ${profile.name || address} on Farcaster. ${stats.tipCount} tips received.`;
  const imageUrl = `${APP_URL}/api/frame/image?address=${address}&name=${encodeURIComponent(profile.name || '')}&avatar=${encodeURIComponent(profile.avatar || '')}&total=${stats.totalTips}&count=${stats.tipCount}`;

  const frameButtons = DEFAULT_TIP_AMOUNTS.slice(0, 3).map((amount, i) => ({
    [`fc:frame:button:${i + 1}`]: `${amount} ETH`,
    [`fc:frame:button:${i + 1}:action`]: 'tx',
    [`fc:frame:button:${i + 1}:target`]: `${APP_URL}/api/frame/tx?recipient=${address}&amount=${amount}`,
  }));

  const frameMetadata = {
    'fc:frame': 'vNext',
    'fc:frame:image': imageUrl,
    'fc:frame:image:aspect_ratio': '1.91:1',
    'fc:frame:post_url': `${APP_URL}/api/frame/${address}`,
    ...Object.assign({}, ...frameButtons),
    'fc:frame:button:4': 'Custom 💜',
    'fc:frame:button:4:action': 'post',
  };

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [imageUrl],
    },
    other: frameMetadata,
  };
}

export default async function FramePage({ params }: Props) {
  const { address } = params;

  if (!isAddress(address)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Address</h1>
          <p className="text-slate-400">The provided address is not valid.</p>
        </div>
      </div>
    );
  }

  const [stats, profile] = await Promise.all([
    getCreatorStats(address as Address),
    getCreatorProfile(address),
  ]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card p-8 max-w-md w-full text-center">
        {/* Avatar */}
        {profile.avatar ? (
          <img 
            src={profile.avatar} 
            alt={profile.name || address}
            className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-purple-500"
          />
        ) : (
          <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl">
            💜
          </div>
        )}

        {/* Name */}
        <h1 className="text-2xl font-bold mb-2">
          {profile.name || `${address.slice(0, 6)}...${address.slice(-4)}`}&apos;s Tip Jar
        </h1>

        {/* Stats */}
        <div className="flex justify-center gap-8 mb-6 text-slate-400">
          <div>
            <div className="text-xl font-bold text-white">{parseFloat(stats.totalTips).toFixed(4)}</div>
            <div className="text-sm">ETH Received</div>
          </div>
          <div>
            <div className="text-xl font-bold text-white">{stats.tipCount}</div>
            <div className="text-sm">Tips</div>
          </div>
        </div>

        {/* Info */}
        <p className="text-slate-400 mb-6">
          This page is designed to be viewed as a Farcaster Frame.
          Open this link in Warpcast or another Farcaster client to tip!
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <a 
            href={`https://warpcast.com/~/compose?embeds[]=${encodeURIComponent(`${APP_URL}/frame/${address}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full block"
          >
            Open in Warpcast
          </a>
          <a href="/" className="btn-secondary w-full block">
            Create Your Own Tip Jar
          </a>
        </div>

        {/* Branding */}
        <div className="mt-8 pt-6 border-t border-white/10 text-slate-500 text-sm">
          Powered by Tip Jar Frames 💜 on Base
        </div>
      </div>
    </div>
  );
}
