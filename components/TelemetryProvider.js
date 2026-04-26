'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { captureEvent } from '../utils/telemetryClient';

// Track max scroll depth per page
function useScrollDepth() {
  const maxDepth = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const depth = Math.round((window.scrollY / docHeight) * 100);
      if (depth > maxDepth.current) {
        maxDepth.current = depth;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return maxDepth;
}

export default function TelemetryProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageEnterTime = useRef(Date.now());
  const maxScrollDepth = useScrollDepth();

  // ── Page view on route change ──────────────────────────────────
  useEffect(() => {
    pageEnterTime.current = Date.now();
    maxScrollDepth.current = 0;

    // Capture extra context on each page view
    const extras = {
      path: pathname,
      params: searchParams.toString(),
      referrer: document.referrer || 'direct',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      languages: navigator.languages?.join(','),
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      connection: navigator.connection
        ? {
            type: navigator.connection.effectiveType,
            downlink: navigator.connection.downlink,
            rtt: navigator.connection.rtt,
            saveData: navigator.connection.saveData,
          }
        : null,
      colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      touchSupport: navigator.maxTouchPoints > 0,
      maxTouchPoints: navigator.maxTouchPoints,
      deviceMemory: navigator.deviceMemory || null,
      hardwareConcurrency: navigator.hardwareConcurrency || null,
      pixelRatio: window.devicePixelRatio,
      physicalScreen: {
        width: window.screen.width,
        height: window.screen.height,
        availWidth: window.screen.availWidth,
        availHeight: window.screen.availHeight,
        colorDepth: window.screen.colorDepth,
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };

    captureEvent('page_view', extras);
  }, [pathname, searchParams]);

  // ── Page leave: dwell time + scroll depth ─────────────────────
  useEffect(() => {
    const handleUnload = () => {
      const dwellMs = Date.now() - pageEnterTime.current;
      // Use sendBeacon-style via captureEvent (best-effort)
      captureEvent('page_leave', {
        path: pathname,
        dwellSeconds: Math.round(dwellMs / 1000),
        maxScrollDepthPct: maxScrollDepth.current,
      });
    };

    window.addEventListener('beforeunload', handleUnload);
    // Also fire on route change (SPA navigation)
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      handleUnload();
    };
  }, [pathname]);

  // ── Click tracking (external links & CTA buttons) ─────────────
  useEffect(() => {
    const handleClick = (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      const isExternal = href?.startsWith('http') && !href.includes(window.location.hostname);
      if (isExternal) {
        captureEvent('outbound_click', {
          href,
          text: link.innerText?.slice(0, 80),
          path: pathname,
        });
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pathname]);

  // ── Visibility change (tab switching) ─────────────────────────
  useEffect(() => {
    const handleVisibility = () => {
      captureEvent('visibility_change', {
        state: document.visibilityState,
        path: pathname,
      });
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [pathname]);

  // ── Performance metrics ────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || !window.performance) return;
    // Wait for page load to settle
    const timer = setTimeout(() => {
      try {
        const nav = performance.getEntriesByType('navigation')[0];
        if (nav) {
          captureEvent('performance', {
            path: pathname,
            loadTimeMs: Math.round(nav.loadEventEnd - nav.startTime),
            domContentLoadedMs: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
            ttfbMs: Math.round(nav.responseStart - nav.requestStart),
          });
        }
      } catch (_) {}
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
