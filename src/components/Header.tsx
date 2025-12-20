'use client';

import { ConnectKitButton } from 'connectkit';
import Link from 'next/link';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-background)]/80 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">💜</span>
          <span className="font-bold text-lg">Tip Jar</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="#how-it-works" className="text-slate-400 hover:text-white transition">
            How it Works
          </Link>
          <Link href="#features" className="text-slate-400 hover:text-white transition">
            Features
          </Link>
          <a 
            href="https://github.com/your-repo/tip-jar-frames" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white transition"
          >
            GitHub
          </a>
        </nav>

        <ConnectKitButton />
      </div>
    </header>
  );
}
