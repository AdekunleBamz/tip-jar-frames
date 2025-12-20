import { NextRequest, NextResponse } from 'next/server';

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username required' }, { status: 400 });
  }

  if (!NEYNAR_API_KEY) {
    return NextResponse.json({ error: 'API not configured' }, { status: 500 });
  }

  try {
    // Search for user by username
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/by_username?username=${encodeURIComponent(username)}`,
      {
        headers: {
          accept: 'application/json',
          api_key: NEYNAR_API_KEY,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: response.status });
    }

    const data = await response.json();
    const user = data.user;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get verified addresses (wallets connected to Farcaster)
    const verifiedAddresses = user.verified_addresses?.eth_addresses || [];
    const custodyAddress = user.custody_address;
    
    // Prefer verified address, fall back to custody
    const walletAddress = verifiedAddresses[0] || custodyAddress;

    if (!walletAddress) {
      return NextResponse.json({ error: 'No wallet found for user' }, { status: 404 });
    }

    return NextResponse.json({
      fid: user.fid,
      username: user.username,
      displayName: user.display_name || user.username,
      avatar: user.pfp_url,
      bio: user.profile?.bio?.text,
      walletAddress,
      verifiedAddresses,
    });
  } catch (error) {
    console.error('Error looking up user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
