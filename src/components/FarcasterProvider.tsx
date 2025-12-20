'use client';

import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import sdk from '@farcaster/miniapp-sdk';

interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

interface FarcasterContextType {
  isSDKLoaded: boolean;
  context: any;
  isInFrame: boolean;
  user: FarcasterUser | null;
}

const FarcasterContext = createContext<FarcasterContextType>({
  isSDKLoaded: false,
  context: null,
  isInFrame: false,
  user: null,
});

export function useFarcaster() {
  return useContext(FarcasterContext);
}

export function FarcasterProvider({ children }: { children: ReactNode }) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<any>(null);
  const [user, setUser] = useState<FarcasterUser | null>(null);

  useEffect(() => {
    const initSDK = async () => {
      try {
        // Get context from Farcaster
        const ctx = await sdk.context;
        setContext(ctx);
        
        // Extract user info from context
        if (ctx?.user) {
          setUser({
            fid: ctx.user.fid,
            username: ctx.user.username,
            displayName: ctx.user.displayName,
            pfpUrl: ctx.user.pfpUrl,
          });
        }
        
        // Signal that the app is ready
        sdk.actions.ready();
        
        setIsSDKLoaded(true);
        console.log('Farcaster SDK initialized', ctx);
      } catch (error) {
        console.log('Not in Farcaster frame context', error);
        setIsSDKLoaded(true);
      }
    };

    initSDK();
  }, []);

  const isInFrame = !!context;

  return (
    <FarcasterContext.Provider value={{ isSDKLoaded, context, isInFrame, user }}>
      {children}
    </FarcasterContext.Provider>
  );
}
