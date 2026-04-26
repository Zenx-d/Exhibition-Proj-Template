'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { captureEvent, captureReferral } from '../utils/telemetryClient';

export default function TelemetryProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const enterTimeRef = useRef(Date.now());
  const maxScrollRef = useRef(0);
  const isNavigatingRef = useRef(false); // prevent double-fire on SPA nav

  // ── Scroll depth tracker ────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const pct = Math.round((window.scrollY / docHeight) * 100);
      if (pct > maxScrollRef.current) maxScrollRef.current = pct;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Page view on route change ───────────────────────────────────────────────
  useEffect(() => {
    // Reset tracking state for new page
    enterTimeRef.current = Date.now();
    maxScrollRef.current = 0;
    isNavigatingRef.current = false;

    captureEvent('page_view', {
      path: pathname,
      params: searchParams.toString() || null,
      referrer: typeof document !== 'undefined' ? document.referrer || 'direct' : null,
    });

    // ── Referral tracking ────────────────────────────────────────────────────
    const refTags = ['ref', 'referredby', 'utm_source', 'source', 'via', 'tag'];
    let foundTag = null;
    let foundSource = 'url_param';

    for (const key of refTags) {
      const val = searchParams.get(key);
      if (val) {
        foundTag = val;
        foundSource = key;
        break;
      }
    }

    if (foundTag) {
      const storageKey = `ref_${foundTag}_${foundSource}`;
      const alreadyTracked = sessionStorage.getItem(storageKey);
      if (!alreadyTracked) {
        captureReferral(foundTag, foundSource, {
          full_query: searchParams.toString(),
          landing_page: pathname
        });
        sessionStorage.setItem(storageKey, 'true');
      }
    }
  }, [pathname, searchParams]);

  // ── Page leave: dwell time + scroll depth ──────────────────────────────────
  useEffect(() => {
    const fireDwellEvent = () => {
      if (isNavigatingRef.current) return;
      isNavigatingRef.current = true;
      const dwellMs = Date.now() - enterTimeRef.current;
      captureEvent(
        'page_leave',
        { path: pathname, dwellSeconds: Math.round(dwellMs / 1000) },
        { timing: { dwellSeconds: Math.round(dwellMs / 1000), maxScrollDepthPct: maxScrollRef.current } }
      );
    };

    window.addEventListener('beforeunload', fireDwellEvent);
    return () => {
      window.removeEventListener('beforeunload', fireDwellEvent);
      // SPA navigation — fire leave event for the old route
      fireDwellEvent();
    };
  }, [pathname]);

  // ── Outbound link clicks ────────────────────────────────────────────────────
  useEffect(() => {
    const handleClick = (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href') || '';
      const isExternal = href.startsWith('http') && !href.includes(window.location.hostname);
      if (isExternal) {
        captureEvent('outbound_click', {
          href: href.slice(0, 512),
          text: (link.innerText || '').slice(0, 80),
          path: pathname,
        }, { category: 'navigation' });
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pathname]);

  // ── Tab visibility changes ──────────────────────────────────────────────────
  useEffect(() => {
    const onVisibility = () => {
      captureEvent('visibility_change', {
        state: document.visibilityState,
        path: pathname,
      }, { category: 'system' });
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [pathname]);

  // ── Performance metrics (once per session) ─────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || !window.performance) return;
    const timer = setTimeout(() => {
      try {
        const [nav] = performance.getEntriesByType('navigation');
        if (!nav) return;
        captureEvent('performance', {
          path: pathname,
          loadMs: Math.round(nav.loadEventEnd - nav.startTime),
          dclMs: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
          ttfbMs: Math.round(nav.responseStart - nav.requestStart),
        }, {
          category: 'system',
          perf: {
            loadMs: Math.round(nav.loadEventEnd - nav.startTime),
            dclMs: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
            ttfbMs: Math.round(nav.responseStart - nav.requestStart),
          }
        });
      } catch (_) {}
    }, 1500);
    return () => clearTimeout(timer);
  }, []); // only on mount

  return null;
}
