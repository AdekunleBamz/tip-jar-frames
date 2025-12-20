import Link from 'next/link';

export function Footer() {
  return (
    <footer className="py-12 px-4 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💜</span>
            <span className="font-bold">Tip Jar Frames</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400 text-sm">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <a 
              href="https://basescan.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-white transition"
            >
              Contract
            </a>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-white transition"
            >
              GitHub
            </a>
            <a 
              href="https://warpcast.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-white transition"
            >
              Farcaster
            </a>
          </div>

          <div className="text-slate-500 text-sm">
            Built with 💜 on Base
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 text-center text-slate-500 text-sm">
          <p>
            Tip Jar Frames is open source software. 
            Tips are non-refundable. 2% protocol fee applies.
          </p>
        </div>
      </div>
    </footer>
  );
}
