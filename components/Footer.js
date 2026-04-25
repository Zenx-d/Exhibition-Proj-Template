'use client';

import { useState } from 'react';
import { subscribeUser } from '../lib/telemetry';
import { captureEvent } from '../utils/telemetryClient';
import SmartLink from './SmartLink';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleSubscribe = async () => {
    if (!email || !email.includes('@')) return;
    setStatus('loading');
    
    const result = await subscribeUser(email);
    
    if (result.success) {
      setStatus('success');
      setEmail('');
      captureEvent('newsletter_signup', { status: 'success' });
    } else {
      setStatus('error');
    }
  };

  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 pt-24 pb-12 transition-colors">
      <div className="max-w-[1440px] mx-auto px-8 md:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          {/* Brand Section */}
          <div className="flex flex-col gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <img 
                src="/logo.svg" 
                alt="Zen Logo" 
                className="w-12 h-12 group-hover:rotate-12 transition-transform duration-500 shadow-xl"
              />
              <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white font-display">
                {configData.siteTitle}
              </span>
            </Link>
            <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Pushing the boundaries of digital expression through code, design, and collaborative innovation.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://github.com/Zenx-d" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                <Github size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                <Twitter size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-8">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Navigation</h4>
            <nav className="flex flex-col gap-4">
              {configData.navbar.items.map((item) => (
                <Link key={item.href} href={item.href} className="text-lg font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2 group">
                  {item.name}
                  <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-8">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Contact</h4>
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:scale-110 transition-transform">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Email</p>
                  <p className="text-lg font-bold text-slate-700 dark:text-white">generalexhibition@proton.me</p>
                </div>
              </div>
              <div className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 group-hover:scale-110 transition-transform">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Location</p>
                  <p className="text-lg font-bold text-slate-700 dark:text-white">Silicon Valley, CA</p>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter / Meta */}
          <div className="flex flex-col gap-8">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Newsletter</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Join 5,000+ creators getting monthly updates on our latest technical experiments.</p>
            <div className="relative group">
              <input 
                type="email" 
                placeholder={status === 'success' ? 'Joined!' : 'Enter email...'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading' || status === 'success'}
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all font-bold text-sm disabled:opacity-50"
              />
              <button 
                onClick={handleSubscribe}
                disabled={status === 'loading' || status === 'success'}
                className="absolute right-2 top-2 bottom-2 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-95 transition-transform disabled:scale-100"
              >
                {status === 'loading' ? '...' : status === 'success' ? '✓' : 'Join'}
              </button>
            </div>
            {status === 'error' && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Connection Error</p>}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-slate-100 dark:border-slate-900 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            © {currentYear} {configData.siteTitle}. All Rights Reserved.
          </p>
          <div className="flex items-center gap-8">
            <SmartLink href="/privacy" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">Privacy Policy</SmartLink>
            <SmartLink href="/terms" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">Terms of Service</SmartLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
