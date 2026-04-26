'use client';

import { useState, useEffect } from 'react';
import SmartLink from './SmartLink';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import configData from '../data/config.json';
import { cn } from './Badge';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const navItems = configData.navbar.items || [];

  return (
    <>
      {/* ─── DESKTOP NAV ─── */}
      <header
        className={cn(
          'hidden md:flex fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          isScrolled
            ? 'bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl border-b border-white/20 dark:border-slate-800/50 py-5 shadow-lg shadow-black/5'
            : 'bg-transparent py-10'
        )}
      >
        <div className="max-w-[1440px] mx-auto w-full flex items-center justify-between px-16">
          <SmartLink href="/" className="flex items-center gap-4 group">
            <img
              src="/logo.svg"
              alt="Zen Logo"
              className="w-12 h-12 group-hover:rotate-12 transition-transform duration-500 shadow-xl shadow-indigo-500/20"
            />
            <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white font-display">
              {configData.siteTitle}
            </span>
          </SmartLink>

          <nav className="flex items-center gap-10">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <SmartLink
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'text-xs font-black uppercase tracking-[0.25em] transition-all hover:text-indigo-600 dark:hover:text-indigo-400',
                    isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
                  )}
                >
                  {item.name}
                </SmartLink>
              );
            })}
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800" />
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* ─── MOBILE NAV: Floating Pill ─── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 px-4 pt-4 pointer-events-none">
        <motion.div
          initial={false}
          animate={isScrolled
            ? { y: 0, opacity: 1, scale: 1 }
            : { y: -4, opacity: 1, scale: 1 }
          }
          transition={{ type: 'spring', stiffness: 400, damping: 40 }}
          className={cn(
            'pointer-events-auto flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300',
            isScrolled
              ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl shadow-black/10 border border-white/40 dark:border-slate-700/50'
              : 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/20 dark:border-slate-800/30'
          )}
        >
          {/* Logo */}
          <SmartLink href="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.svg"
              alt="Zen Logo"
              className="w-8 h-8 group-hover:rotate-12 transition-transform duration-300"
            />
            <span className="text-base font-black tracking-tighter text-slate-900 dark:text-white font-display">
              {configData.siteTitle}
            </span>
          </SmartLink>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white active:scale-95 transition-transform"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* ─── MOBILE MENU OVERLAY ─── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Sheet slides up from bottom */}
            <motion.div
              key="sheet"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 38 }}
              className="md:hidden fixed bottom-0 left-0 right-0 z-[70] bg-white dark:bg-slate-900 rounded-t-[2rem] px-6 pt-3 pb-10 shadow-2xl"
            >
              {/* Drag handle */}
              <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-8" />

              {/* Close button */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>

              {/* Nav links */}
              <nav className="flex flex-col gap-2">
                {navItems.map((item, idx) => {
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.06 }}
                    >
                      <SmartLink
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-4 px-4 py-4 rounded-2xl font-black text-xl tracking-tighter transition-all active:scale-95',
                          isActive
                            ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                        )}
                      >
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" />
                        )}
                        {item.name}
                      </SmartLink>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Footer strip */}
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {configData.siteTitle}
                </p>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  2026 Exhibition
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
