import { NextRequest, NextResponse } from 'next/server';

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 });
  }

  if (!NEYNAR_API_KEY) {
    return NextResponse.json({ error: 'API not configured' }, { status: 500 });
  }

  try {
    // Look up user by wallet address
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${address}`,
      {
        headers: {
          accept: 'application/json',
          api_key: NEYNAR_API_KEY,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const data = await response.json();
    const users = data[address.toLowerCase()];

    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'No Farcaster account linked to this address' }, { status: 404 });
    }

    const user = users[0];

    return NextResponse.json({
      fid: user.fid,
      username: user.username,
      displayName: user.display_name || user.username,
      avatar: user.pfp_url,
      bio: user.profile?.bio?.text,
    });
  } catch (error) {
    console.error('Error looking up user by address:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
