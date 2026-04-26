'use client';

import { useState } from 'react';
import { Share2, Link as LinkIcon, Check } from 'lucide-react';

export default function ShareProfile({ memberId, memberName }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/members/${memberId}?ref=${memberId}`
    : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Referral Link</h4>
      <div className="flex items-center gap-2">
        <div className="flex-grow bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 truncate select-all">
          {shareUrl || 'Generating link...'}
        </div>
        <button
          onClick={handleCopy}
          className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
            copied 
              ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20'
          }`}
          title="Copy Referral Link"
        >
          {copied ? <Check size={18} /> : <LinkIcon size={18} />}
        </button>
      </div>
      <p className="text-[10px] text-slate-400 font-medium">
        Share this link to track visitors you bring to the exhibition.
      </p>
    </div>
  );
}
