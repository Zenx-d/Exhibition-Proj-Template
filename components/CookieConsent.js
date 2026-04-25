'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X } from 'lucide-react';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = document.cookie.split('; ').find(row => row.startsWith('cookie-consent='));
    if (!consent) {
      // Delay showing the banner for a better UX
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (accepted) => {
    const date = new Date();
    date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
    document.cookie = `cookie-consent=${accepted}; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
    setShow(false);
    
    if (accepted) {
      // Trigger initial page view if accepted
      window.location.reload(); 
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-8 left-8 right-8 md:left-auto md:right-8 md:max-w-md z-[200]"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <div className="flex items-start gap-5 mb-6">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/20">
                <ShieldCheck size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white mb-2 leading-none">Privacy Check</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  We use anonymous analytics to understand how you interact with the exhibition. No personal data is stored. Allow analytics?
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleConsent(true)}
                className="flex-1 px-6 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/10"
              >
                Accept
              </button>
              <button
                onClick={() => handleConsent(false)}
                className="flex-1 px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Reject
              </button>
            </div>
            
            <button 
              onClick={() => setShow(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
