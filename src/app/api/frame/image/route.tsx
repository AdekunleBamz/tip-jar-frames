import { NextRequest } from 'next/server';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

/**
 * Dynamic image generation for Farcaster Frames
 * Creates beautiful tip jar images with creator info and stats
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const type = searchParams.get('type') || 'og';
  const address = searchParams.get('address') || '0x0000...0000';
  const name = searchParams.get('name') || shortenAddress(address);
  const avatar = searchParams.get('avatar');
  const totalTips = searchParams.get('total') || '0';
  const tipCount = searchParams.get('count') || '0';
  const state = searchParams.get('state') || 'default';

  // Handle different image types for manifest
  if (type === 'icon') {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
            borderRadius: '50%',
          }}
        >
          <div style={{ fontSize: '120px' }}>💜</div>
        </div>
      ),
      { width: 200, height: 200 }
    );
  }

  if (type === 'splash') {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
          }}
        >
          <div
            style={{
              width: '160px',
              height: '160px',
              borderRadius: '80px',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '80px',
              marginBottom: '32px',
            }}
          >
            💜
          </div>
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'white' }}>
            Tip Jar
          </div>
          <div style={{ fontSize: '24px', color: '#94A3B8', marginTop: '12px' }}>
            Tip any Farcaster creator
          </div>
        </div>
      ),
      { width: 600, height: 600 }
    );
  }

  // Default OG image
  let titleText = `${name}'s Tip Jar`;
  let subtitleText = `${tipCount} tips • ${parseFloat(totalTips).toFixed(4)} ETH received`;
  let bgGradient = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)';
  let accentColor = '#8B5CF6';

  if (state === 'success') {
    titleText = '🎉 Tip Sent!';
    subtitleText = `Thank you for supporting ${name}`;
    bgGradient = 'linear-gradient(135deg, #1a2e1a 0%, #162e21 50%, #0f230f 100%)';
    accentColor = '#10B981';
  } else if (state === 'error') {
    titleText = '❌ Invalid Amount';
    subtitleText = 'Please enter at least 0.0001 ETH';
    bgGradient = 'linear-gradient(135deg, #2e1a1a 0%, #2e1621 50%, #230f0f 100%)';
    accentColor = '#EF4444';
  }

  // For type=og without specific creator, show generic Tip Jar image
  if (type === 'og' && !searchParams.get('address')) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: bgGradient,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(circle at 20% 20%, ${accentColor}20 0%, transparent 50%),
                          radial-gradient(circle at 80% 80%, #EC489920 0%, transparent 50%)`,
            }}
          />
          <div
            style={{
              width: '140px',
              height: '140px',
              borderRadius: '70px',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '64px',
              marginBottom: '32px',
              boxShadow: '0 0 60px #8B5CF640',
            }}
          >
            💜
          </div>
          <div style={{ fontSize: '64px', fontWeight: 'bold', color: 'white' }}>
            Tip Jar
          </div>
          <div style={{ fontSize: '28px', color: '#94A3B8', marginTop: '16px' }}>
            Tip any Farcaster creator instantly on Base
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '32px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '20px',
              color: '#64748B',
            }}
          >
            <span>Powered by Base • 2% protocol fee</span>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: bgGradient,
        }}
      >
        {/* Background decoration */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 20% 20%, ${accentColor}20 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, #EC489920 0%, transparent 50%)`,
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            padding: '48px',
            zIndex: 1,
          }}
        >
          {/* Avatar */}
          {avatar ? (
            <img
              src={avatar}
              alt=""
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '60px',
                border: `4px solid ${accentColor}`,
                boxShadow: `0 0 40px ${accentColor}40`,
              }}
            />
          ) : (
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '60px',
                background: `linear-gradient(135deg, ${accentColor} 0%, #EC4899 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                border: `4px solid ${accentColor}`,
                boxShadow: `0 0 40px ${accentColor}40`,
              }}
            >
              💜
            </div>
          )}

          {/* Title */}
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
            }}
          >
            {titleText}
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: '24px',
              color: '#94A3B8',
              textAlign: 'center',
            }}
          >
            {subtitleText}
          </div>

          {/* Stats */}
          {state === 'default' && (
            <div
              style={{
                display: 'flex',
                gap: '48px',
                marginTop: '24px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: accentColor }}>
                  {parseFloat(totalTips).toFixed(4)}
                </div>
                <div style={{ fontSize: '16px', color: '#64748B' }}>ETH Received</div>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: accentColor }}>
                  {tipCount}
                </div>
                <div style={{ fontSize: '16px', color: '#64748B' }}>Tips</div>
              </div>
            </div>
          )}

          {/* Branding */}
          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '18px',
              color: '#64748B',
            }}
          >
            <span>💜</span>
            <span>Tip Jar Frames</span>
            <span style={{ color: '#475569' }}>•</span>
            <span style={{ color: '#475569' }}>Base</span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

function shortenAddress(address: string): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
