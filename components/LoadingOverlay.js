'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingOverlay() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => {
      setTimeout(() => setIsLoading(false), 400);
    };

    handleStart();
    handleComplete();
  }, [pathname]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl"
        >
          <div className="flex flex-col items-center gap-8">
            <div className="relative w-24 h-24">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-slate-200 dark:border-slate-800 rounded-[2.5rem]"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-t-4 border-indigo-600 rounded-[2.5rem]"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 bg-indigo-600 rounded-full animate-pulse shadow-[0_0_20px_rgba(79,70,229,0.5)]" />
              </div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white animate-pulse">
                Synchronizing
              </span>
              <div className="mt-3 flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="w-2 h-2 bg-indigo-600 rounded-full"
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
