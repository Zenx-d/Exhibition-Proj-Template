'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RefreshCcw, Home, Terminal, ShieldAlert } from 'lucide-react';

export default function Error({ error, reset }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.error('Exhibition Runtime Error:', error);
  }, [error]);

  if (!mounted) return null;

  const isCacheError = error?.message?.includes('Cannot find module') || error?.message?.includes('MODULE_NOT_FOUND');

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl aspect-square bg-red-500/5 dark:bg-red-500/10 rounded-full blur-[120px] -z-10" />
      
      <div className="text-[10rem] md:text-[18rem] font-black text-red-500/5 dark:text-red-500/10 absolute -z-10 select-none leading-none tracking-tighter uppercase">
        {isCacheError ? 'CACHE' : 'FAULT'}
      </div>
      
      <div className="w-24 h-24 bg-red-100 dark:bg-red-950/50 rounded-[2rem] flex items-center justify-center text-red-600 dark:text-red-400 mb-10 shadow-2xl shadow-red-500/20 animate-pulse">
        <ShieldAlert size={48} />
      </div>

      <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-900 dark:text-white mb-6 leading-none">
        {isCacheError ? 'Sync Interrupted.' : 'Runtime Glitch.'}
      </h1>
      
      <div className="max-w-2xl mb-12">
        <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 font-bold mb-8">
          {isCacheError 
            ? "The platform's local cache has become out of sync. A quick refresh or build restart should fix this instantly."
            : "We encountered a logic fault while rendering this view. Our diagnostic engine has logged the event."}
        </p>
        
        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-3xl blur opacity-100 transition duration-1000 group-hover:duration-200" />
          <div className="relative p-6 bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/30 rounded-3xl text-red-600 dark:text-red-400 font-mono text-sm break-all text-left shadow-xl">
            <div className="flex items-center gap-2 mb-3 opacity-50">
              <Terminal size={14} />
              <span className="font-black uppercase tracking-widest text-[10px]">System Diagnostic</span>
            </div>
            <p className="font-bold leading-relaxed">
              {error?.message || "An unknown exception occurred."}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-6 flex-wrap justify-center relative z-10">
        <button
          onClick={() => {
            if (isCacheError) {
              window.location.reload();
            } else {
              reset();
            }
          }}
          className="flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white font-black text-xl rounded-3xl hover:bg-indigo-700 hover:shadow-[0_20px_50px_rgba(79,70,229,0.3)] transition-all duration-500 group"
        >
          <RefreshCcw size={24} className="group-hover:rotate-180 transition-transform duration-700" /> 
          {isCacheError ? 'Force Reload' : 'Try Recovery'}
        </button>
        <Link 
          href="/"
          className="flex items-center gap-3 px-10 py-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black text-xl rounded-3xl border-2 border-slate-200 dark:border-slate-800 hover:border-indigo-600 transition-all duration-500"
        >
          <Home size={24} /> Return Home
        </Link>
      </div>
      
      {isCacheError && (
        <p className="mt-12 text-sm font-black text-slate-400 uppercase tracking-widest">
          Tip: Try running <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">rm -rf .next</code> if the error persists.
        </p>
      )}
    </div>
  );
}
