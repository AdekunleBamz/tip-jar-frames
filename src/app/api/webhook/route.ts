import { NextRequest, NextResponse } from 'next/server';

/**
 * Webhook endpoint for Farcaster Mini App events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log webhook events for debugging
    console.log('Farcaster webhook event:', JSON.stringify(body, null, 2));
    
    // Handle different event types
    const { event } = body;
    
    switch (event) {
      case 'frame_added':
        // User added the mini app
        console.log('User added Tip Jar mini app');
        break;
      case 'frame_removed':
        // User removed the mini app
        console.log('User removed Tip Jar mini app');
        break;
      case 'notifications_enabled':
        // User enabled notifications
        console.log('User enabled notifications');
        break;
      case 'notifications_disabled':
        // User disabled notifications
        console.log('User disabled notifications');
        break;
      default:
        console.log('Unknown event:', event);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    app: 'Tip Jar Frames',
    version: '1.0.0'
  });
}
