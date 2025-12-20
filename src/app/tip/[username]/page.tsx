import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { APP_URL, DEFAULT_TIP_AMOUNTS } from '@/lib/constants';

interface Props {
  params: { username: string };
}

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;

async function getUserByUsername(username: string) {
  if (!NEYNAR_API_KEY) return null;

  try {
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/by_username?username=${encodeURIComponent(username)}`,
      {
        headers: {
          accept: 'application/json',
          api_key: NEYNAR_API_KEY,
        },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const user = data.user;

    if (!user) return null;

    const verifiedAddresses = user.verified_addresses?.eth_addresses || [];
    const walletAddress = verifiedAddresses[0] || user.custody_address;

    return {
      fid: user.fid,
      username: user.username,
      displayName: user.display_name || user.username,
      avatar: user.pfp_url,
      bio: user.profile?.bio?.text,
      walletAddress,
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = params;
  const user = await getUserByUsername(username);

  if (!user) {
    return { title: 'User Not Found - Tip Jar' };
  }

  const title = `Tip @${user.username}`;
  const description = `Send a tip to @${user.username} on Farcaster via Tip Jar.`;
  const imageUrl = `${APP_URL}/api/frame/image?address=${user.walletAddress}&name=${encodeURIComponent(user.displayName)}&avatar=${encodeURIComponent(user.avatar || '')}`;

  const frameButtons = DEFAULT_TIP_AMOUNTS.slice(0, 3).map((amount, i) => ({
    [`fc:frame:button:${i + 1}`]: `${amount} ETH`,
    [`fc:frame:button:${i + 1}:action`]: 'tx',
    [`fc:frame:button:${i + 1}:target`]: `${APP_URL}/api/frame/tx?recipient=${user.walletAddress}&amount=${amount}`,
  }));

  const frameMetadata = {
    'fc:frame': 'vNext',
    'fc:frame:image': imageUrl,
    'fc:frame:image:aspect_ratio': '1.91:1',
    'fc:frame:post_url': `${APP_URL}/api/frame/${user.walletAddress}`,
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

export default async function TipUserPage({ params }: Props) {
  const { username } = params;
  const user = await getUserByUsername(username);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
          <p className="text-slate-400">@{username} was not found on Farcaster.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card p-8 max-w-md w-full text-center">
        {/* Avatar */}
        {user.avatar ? (
          <img 
            src={user.avatar} 
            alt={user.displayName}
            className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-purple-500"
          />
        ) : (
          <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl">
            💜
          </div>
        )}

        {/* Name */}
        <h1 className="text-2xl font-bold mb-1">{user.displayName}</h1>
        <div className="text-purple-400 mb-4">@{user.username}</div>

        {/* Bio */}
        {user.bio && (
          <p className="text-slate-400 text-sm mb-6">{user.bio}</p>
        )}

        {/* Info */}
        <p className="text-slate-400 mb-6">
          This page is designed to be viewed as a Farcaster Frame.
          Open this link in Warpcast or another Farcaster client to tip!
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <a 
            href={`https://warpcast.com/~/compose?embeds[]=${encodeURIComponent(`${APP_URL}/tip/${username}`)}`}
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
          Powered by Tip Jar 💜 on Base
        </div>
      </div>
    </div>
  );
}
