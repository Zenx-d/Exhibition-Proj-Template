'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = configData.navbar.items || [];

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
      isScrolled 
        ? "bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl border-b border-slate-200 dark:border-slate-800 py-4 md:py-6 shadow-md" 
        : "bg-transparent py-6 md:py-10"
    )}>
      <div className="max-w-[1440px] mx-auto flex items-center justify-between px-6 md:px-16">
        <SmartLink href="/" className="flex items-center gap-3 md:gap-4 group">
          <img 
            src="/logo.svg" 
            alt="Zen Logo" 
            className="w-10 h-10 md:w-14 md:h-14 group-hover:rotate-12 transition-transform duration-500 shadow-xl shadow-indigo-500/20"
          />
          <span className="text-xl md:text-3xl font-black tracking-tighter text-slate-900 dark:text-white font-display">
            {configData.siteTitle}
          </span>
        </SmartLink>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <SmartLink 
                key={item.href} 
                href={item.href} 
                className={cn(
                  "text-sm font-black uppercase tracking-[0.25em] transition-all hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-110",
                  isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"
                )}
              >
                {item.name}
              </SmartLink>
            );
          })}
          <div className="w-px h-10 bg-slate-200 dark:bg-slate-800 mx-4" />
          <ThemeToggle />
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center gap-4">
          <ThemeToggle />
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-900 dark:text-white"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-8 md:hidden"
          >
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-8 right-8 p-2 text-slate-900 dark:text-white"
              aria-label="Close Menu"
            >
              <X size={36} />
            </button>
            
            <nav className="flex flex-col gap-8 text-center w-full">
              {navItems.map((item) => (
                <SmartLink 
                  key={item.href} 
                  href={item.href} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-2"
                >
                  {item.name}
                </SmartLink>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
