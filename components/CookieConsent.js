'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X } from 'lucide-react';
import { captureEvent } from '../utils/telemetryClient';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = document.cookie.split('; ').find(r => r.startsWith('cookie-consent='));
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const setConsentCookie = (value) => {
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    // SameSite=Lax is safe here; Secure would require HTTPS
    document.cookie = `cookie-consent=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  };

  const handleAccept = () => {
    setConsentCookie('true');
    setShow(false);
    // Fire initial page_view immediately — no reload needed
    captureEvent('page_view', {
      path: window.location.pathname,
      params: window.location.search || null,
      referrer: document.referrer || 'direct',
      consentJustGranted: true,
    });
  };

  const handleReject = () => {
    setConsentCookie('false');
    setShow(false);
  };

  const handleDismiss = () => {
    // X = implicit reject — record decision so banner doesn't reappear
    setConsentCookie('false');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 35 }}
          className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-[150]"
        >
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[1.75rem] p-6 shadow-2xl shadow-black/20 dark:shadow-black/50 relative">
            
            {/* Dismiss button — records decision */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>

            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/20">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white mb-1 leading-tight">
                  Privacy Settings
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  We use anonymous analytics to improve the exhibition experience. No personal data is ever sold.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAccept}
                className="flex-1 py-3 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-500/20"
              >
                Accept
              </button>
              <button
                onClick={handleReject}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
              >
                Reject
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
