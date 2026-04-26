'use client';

import { useState, useCallback } from 'react';
import { captureEvent } from '../utils/telemetryClient';
import { subscribeUser } from '../lib/telemetry';
import posthog from 'posthog-js';
import SmartLink from './SmartLink';
import Link from 'next/link';
import { Github, Twitter, Linkedin, Mail, MapPin, ExternalLink, Check, AlertCircle } from 'lucide-react';
import configData from '../data/config.json';
import { validateEmail } from '../lib/emailValidator';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [emailError, setEmailError] = useState(null);
  const [emailSuggestion, setEmailSuggestion] = useState(null); // { text: string, email: string }

  const handleEmailChange = useCallback((val) => {
    setEmail(val);
    if (status === 'error') setStatus('idle');
    if (val.length > 5) {
      const result = validateEmail(val);
      setEmailError(result.error);
      if (result.suggestion) {
        setEmailSuggestion({ text: `Did you mean ${result.suggestion}?`, email: result.suggestion });
      } else {
        setEmailSuggestion(null);
      }
    } else {
      setEmailError(null);
      setEmailSuggestion(null);
    }
  }, [status]);

  const handleSubscribe = async () => {
    const result = validateEmail(email);
    if (!result.valid) {
      setEmailError(result.error);
      return;
    }
    setStatus('loading');
    setEmailError(null);
    setEmailSuggestion(null);
    
    // Use PostHog to store the subscriber securely and reliably
    posthog.identify(email); 
    posthog.set_person_properties({ 
      email: email,
      subscribed_at: new Date().toISOString(),
      source: 'footer_newsletter'
    });
    
    // Save securely to DB without throwing schema errors
    try {
      // Look for any referral tags in sessionStorage to attribute this signup
      let refSource = window.location.pathname;
      try {
        const keys = Object.keys(sessionStorage);
        const refKey = keys.find(k => k.startsWith('ref_'));
        if (refKey) {
          const tag = refKey.replace('ref_', '').split('_')[0];
          refSource = `ref:${tag} on ${window.location.pathname}`;
        }
      } catch (_) {}

      await subscribeUser(email, refSource);
    } catch (e) {
      // Ignore DB schema errors, we rely on PostHog as primary
    }

    captureEvent('newsletter_signup', { email_hashed: await sha256(email) });

    setStatus('success');
    setEmail('');
  };

  async function sha256(message) {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 pt-16 md:pt-24 pb-10 md:pb-12 transition-colors">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-16">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 lg:gap-16 mb-16 md:mb-24">
          
          {/* Brand */}
          <div className="md:col-span-12 lg:col-span-4 flex flex-col gap-6">
            <SmartLink href="/" className="flex items-center gap-3 group w-fit">
              <img
                src="/logo.svg"
                alt="Zen Logo"
                className="w-10 h-10 md:w-12 md:h-12 group-hover:rotate-12 transition-transform duration-500 shadow-xl"
              />
              <span className="text-xl md:text-2xl font-black tracking-tighter text-slate-900 dark:text-white font-display">
                {configData.siteTitle}
              </span>
            </SmartLink>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed font-medium max-w-xs">
              Pushing the boundaries of digital expression through code, design, and collaborative innovation.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://github.com/Zenx-d/Exhibition-Proj-Template" target="_blank" rel="noreferrer" aria-label="GitHub"
                className="w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                <Github size={18} />
              </a>
              <a href="#" aria-label="Twitter"
                className="w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                <Twitter size={18} />
              </a>
              <a href="#" aria-label="LinkedIn"
                className="w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="md:col-span-4 lg:col-span-2 flex flex-col gap-5 md:gap-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Navigation</h4>
            <nav className="flex flex-col gap-3 md:gap-4">
              {configData.navbar.items.map((item) => (
                <Link key={item.href} href={item.href}
                  className="text-base md:text-lg font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2 group">
                  {item.name}
                  <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div className="md:col-span-8 lg:col-span-3 flex flex-col gap-5 md:gap-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Contact</h4>
            <div className="flex flex-col gap-4 md:gap-6">
              <div className="flex items-start gap-3 group">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:scale-110 transition-transform">
                  <Mail size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Email</p>
                  <a href={`mailto:${configData.contact?.email || 'generalexhibition@proton.me'}`} className="text-sm md:text-base font-bold text-slate-700 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap overflow-hidden text-ellipsis block">
                    {configData.contact?.email || 'generalexhibition@proton.me'}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 group-hover:scale-110 transition-transform">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Location</p>
                  <p className="text-sm md:text-base font-bold text-slate-700 dark:text-white">
                    {configData.contact?.location || 'Nepal'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-12 lg:col-span-3 flex flex-col gap-5 md:gap-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Newsletter</h4>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Get monthly updates on our latest technical experiments.
            </p>
            <div className="flex flex-col gap-2">
              <div className="relative">
                <input
                  type="email"
                  placeholder={status === 'success' ? 'Subscribed! 🎉' : 'your@email.com'}
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                  disabled={status === 'loading' || status === 'success'}
                  className={`w-full pl-4 pr-20 py-3.5 md:py-4 border rounded-2xl transition-all font-bold text-sm disabled:opacity-60 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400
                    ${emailError
                      ? 'border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-300'
                      : status === 'success'
                      ? 'border-green-400 dark:border-green-500'
                      : 'border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600'
                    }`}
                />
                <button
                  onClick={handleSubscribe}
                  disabled={status === 'loading' || status === 'success' || !!emailError}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50
                    bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-95 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? '…' : status === 'success' ? <Check size={14} /> : 'Join'}
                </button>
              </div>
              {/* Validation feedback */}
              {emailError && (
                <div className="flex items-start gap-1.5">
                  <AlertCircle size={12} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-red-500 font-bold leading-tight">{emailError}</p>
                </div>
              )}
              {emailSuggestion && (
                <button
                  onClick={() => handleEmailChange(emailSuggestion.email)}
                  className="text-left text-[10px] text-indigo-500 font-bold hover:text-indigo-700 transition-colors"
                >
                  💡 {emailSuggestion.text}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 md:pt-12 border-t border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-center sm:text-left">
            © {currentYear} {configData.siteTitle}. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6">
            <SmartLink href="/privacy" className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
              Privacy Policy
            </SmartLink>
            <SmartLink href="/terms" className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
              Terms of Service
            </SmartLink>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1"
            >
              Back to Top ↑
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
