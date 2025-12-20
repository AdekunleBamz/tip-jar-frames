import { APP_URL, APP_NAME } from './constants';

export interface FrameMetadata {
  version: 'vNext';
  image: string;
  imageAspectRatio?: '1.91:1' | '1:1';
  buttons?: FrameButton[];
  input?: { text: string };
  postUrl?: string;
  state?: string;
}

export interface FrameButton {
  label: string;
  action?: 'post' | 'post_redirect' | 'link' | 'tx';
  target?: string;
}

/**
 * Generate HTML with frame meta tags
 */
export function generateFrameHtml(metadata: FrameMetadata, title?: string): string {
  const buttons = metadata.buttons || [];
  
  let metaTags = `
    <meta property="fc:frame" content="${metadata.version}" />
    <meta property="fc:frame:image" content="${metadata.image}" />
    <meta property="fc:frame:image:aspect_ratio" content="${metadata.imageAspectRatio || '1.91:1'}" />
  `;

  if (metadata.postUrl) {
    metaTags += `<meta property="fc:frame:post_url" content="${metadata.postUrl}" />`;
  }

  if (metadata.input) {
    metaTags += `<meta property="fc:frame:input:text" content="${metadata.input.text}" />`;
  }

  if (metadata.state) {
    metaTags += `<meta property="fc:frame:state" content="${metadata.state}" />`;
  }

  buttons.forEach((button, index) => {
    const buttonNum = index + 1;
    metaTags += `<meta property="fc:frame:button:${buttonNum}" content="${button.label}" />`;
    if (button.action) {
      metaTags += `<meta property="fc:frame:button:${buttonNum}:action" content="${button.action}" />`;
    }
    if (button.target) {
      metaTags += `<meta property="fc:frame:button:${buttonNum}:target" content="${button.target}" />`;
    }
  });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title || APP_NAME}</title>
  <meta property="og:title" content="${title || APP_NAME}" />
  <meta property="og:image" content="${metadata.image}" />
  ${metaTags}
</head>
<body>
  <h1>${title || APP_NAME}</h1>
  <p>This page is designed to be viewed as a Farcaster Frame.</p>
</body>
</html>`;
}

/**
 * Generate frame image URL
 */
export function getFrameImageUrl(
  creatorAddress: string,
  params?: {
    name?: string;
    avatar?: string;
    totalTips?: string;
    tipCount?: number;
    state?: 'default' | 'success' | 'error';
  }
): string {
  const searchParams = new URLSearchParams();
  searchParams.set('address', creatorAddress);
  
  if (params?.name) searchParams.set('name', params.name);
  if (params?.avatar) searchParams.set('avatar', params.avatar);
  if (params?.totalTips) searchParams.set('total', params.totalTips);
  if (params?.tipCount !== undefined) searchParams.set('count', params.tipCount.toString());
  if (params?.state) searchParams.set('state', params.state);

  return `${APP_URL}/api/frame/image?${searchParams.toString()}`;
}

/**
 * Generate transaction target URL for tipping
 */
export function getTxTargetUrl(creatorAddress: string, amount: string): string {
  return `${APP_URL}/api/frame/tx?recipient=${creatorAddress}&amount=${amount}`;
}

/**
 * Parse frame state from encoded string
 */
export function parseFrameState(stateString?: string): Record<string, string> {
  if (!stateString) return {};
  try {
    return JSON.parse(decodeURIComponent(stateString));
  } catch {
    return {};
  }
}

/**
 * Encode frame state to string
 */
export function encodeFrameState(state: Record<string, string>): string {
  return encodeURIComponent(JSON.stringify(state));
}
