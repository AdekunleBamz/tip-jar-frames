import { NEYNAR_API_KEY } from './constants';

export interface CreatorProfile {
  name?: string;
  username?: string;
  avatar?: string;
  bio?: string;
  fid?: number;
}

/**
 * Get creator profile from Farcaster via Neynar API
 */
export async function getCreatorProfile(address: string): Promise<CreatorProfile> {
  // If no API key, return basic profile
  if (!NEYNAR_API_KEY) {
    return {
      name: shortenAddress(address),
    };
  }

  try {
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${address}`,
      {
        headers: {
          accept: 'application/json',
          api_key: NEYNAR_API_KEY,
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      console.error('Neynar API error:', response.status);
      return { name: shortenAddress(address) };
    }

    const data = await response.json();
    const users = data[address.toLowerCase()];

    if (!users || users.length === 0) {
      return { name: shortenAddress(address) };
    }

    const user = users[0];
    return {
      name: user.display_name || user.username,
      username: user.username,
      avatar: user.pfp_url,
      bio: user.profile?.bio?.text,
      fid: user.fid,
    };
  } catch (error) {
    console.error('Error fetching creator profile:', error);
    return { name: shortenAddress(address) };
  }
}

/**
 * Get creator profile by FID
 */
export async function getProfileByFid(fid: number): Promise<CreatorProfile> {
  if (!NEYNAR_API_KEY) {
    return {};
  }

  try {
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
      {
        headers: {
          accept: 'application/json',
          api_key: NEYNAR_API_KEY,
        },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      return {};
    }

    const data = await response.json();
    const user = data.users?.[0];

    if (!user) {
      return {};
    }

    return {
      name: user.display_name || user.username,
      username: user.username,
      avatar: user.pfp_url,
      bio: user.profile?.bio?.text,
      fid: user.fid,
    };
  } catch (error) {
    console.error('Error fetching profile by FID:', error);
    return {};
  }
}

function shortenAddress(address: string): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
