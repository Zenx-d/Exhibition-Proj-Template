'use client';

import { useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import mermaid from 'mermaid';
import { cn } from './Badge';
import ErrorBoundary from './ErrorBoundary';
import 'katex/dist/katex.min.css';

/**
 * ZEN-GODMODE ENGINE v2.0
 * The ultimate Markdown renderer for exhibitions.
 * Supports: GFM, Math (KaTeX), Mermaid diagrams, Interactive Scripts, 3D Widgets.
 * Protection: Auto-cleanup of background tasks, memory leaks, and global listeners.
 */
export default function MarkdownRenderer({ content, className }) {
  const containerRef = useRef(null);

  // Security: Trusted domains for external assets
  const TRUSTED_DOMAINS = [
    'youtube.com', 'vimeo.com', 'twitter.com', 'instagram.com', 'zenx-d.vercel.app',
    'cdn.jsdelivr.net', 'd3js.org', 'unpkg.com', 'platform.twitter.com', 'google.com',
    'player.vimeo.com', 'www.youtube.com'
  ];

  // Pre-process content for React-friendly event handlers
  const processedContent = useMemo(() => {
    if (!content) return '';
    return content.replace(/onclick=/g, 'data-onclick=');
  }, [content]);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Mermaid Initialization
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'var(--font-outfit)',
    });
    mermaid.run({
      nodes: containerRef.current.querySelectorAll('.mermaid'),
    });

    // 2. Resource Lifecycle Management
    const activeIntervals = new Set();
    const activeTimeouts = new Set();
    const activeListeners = [];
    const scriptElements = [];

    const originalSetInterval = window.setInterval;
    const originalSetTimeout = window.setTimeout;
    const originalWindowAddListener = window.addEventListener;
    const originalDocAddListener = document.addEventListener;
    
    window.setInterval = (...args) => {
      const id = originalSetInterval(...args);
      activeIntervals.add(id);
      return id;
    };
    window.setTimeout = (...args) => {
      const id = originalSetTimeout(...args);
      activeTimeouts.add(id);
      return id;
    };
    window.addEventListener = (type, fn, options) => {
      activeListeners.push([window, type, fn]);
      return originalWindowAddListener.call(window, type, fn, options);
    };
    document.addEventListener = (type, fn, options) => {
      activeListeners.push([document, type, fn]);
      return originalDocAddListener.call(document, type, fn, options);
    };

    // 3. Script Execution (Universal System)
    const deployScripts = async () => {
      const placeholders = containerRef.current.querySelectorAll('.markdown-script-placeholder');
      for (const p of placeholders) {
        if (p.hasAttribute('data-executed')) continue;
        p.setAttribute('data-executed', 'true');
        
        await new Promise((resolve) => {
          const script = document.createElement('script');
          if (p.dataset.src) {
            const isTrusted = TRUSTED_DOMAINS.some(d => p.dataset.src.includes(d));
            if (!isTrusted) {
              console.warn(`[Zen] Blocked untrusted script: ${p.dataset.src}`);
              resolve();
              return;
            }
            script.src = p.dataset.src;
            script.onload = resolve;
            script.onerror = resolve;
          } else {
            script.textContent = `(function(){ try { ${p.textContent} } catch(e){ console.error('[Zen Logic Error]:', e); } })();`;
            setTimeout(resolve, 5);
          }
          if (p.dataset.type) script.type = p.dataset.type;
          if (p.dataset.async) script.async = true;
          scriptElements.push(script);
          document.body.appendChild(script);
        });
      }
    };

    deployScripts();

    // 4. Interactive Re-hydration
    const interactive = containerRef.current.querySelectorAll('[data-onclick]');
    interactive.forEach((el) => {
      if (el.hasAttribute('data-handler-attached')) return;
      const code = el.getAttribute('data-onclick');
      const handler = (e) => {
        try { new Function('event', code).call(el, e); } catch (err) { console.error('Event Error:', err); }
      };
      el.addEventListener('click', handler);
      el.setAttribute('data-handler-attached', 'true');
      el._zenHandler = handler;
    });

    // 5. Cleanup Protocol
    return () => {
      window.setInterval = originalSetInterval;
      window.setTimeout = originalSetTimeout;
      window.addEventListener = originalWindowAddListener;
      document.addEventListener = originalDocAddListener;
      
      activeIntervals.forEach(clearInterval);
      activeTimeouts.forEach(clearTimeout);
      activeListeners.forEach(([t, type, f]) => t.removeEventListener(type, f));
      scriptElements.forEach(s => s.remove());
      
      if (containerRef.current) {
        containerRef.current.querySelectorAll('[data-onclick]').forEach(el => {
          if (el._zenHandler) el.removeEventListener('click', el._zenHandler);
        });
      }
    };
  }, [processedContent]);

  const schema = {
    ...defaultSchema,
    tagNames: [
      ...(defaultSchema.tagNames || []), 
      'script', 'span', 'canvas', 'iframe', 'audio', 'video', 'source', 
      'embed', 'style', 'link', 'blockquote', 'button', 'input', 'label', 'form',
      'details', 'summary', 'svg', 'path', 'circle', 'math', 'annotation'
    ],
    attributes: {
      ...defaultSchema.attributes,
      '*': [...(defaultSchema.attributes?.['*'] || []), 'style', 'className', 'id', 'data-onclick', 'data-*'],
      iframe: ['src', 'width', 'height', 'allow', 'allowfullscreen', 'sandbox', 'frameborder', 'loading'],
      button: ['onclick', 'type', 'class'],
      span: ['data-src', 'data-type', 'data-async'],
      script: ['src', 'type', 'async'],
    }
  };

  return (
    <div ref={containerRef} className={cn("markdown-container max-w-none zen-godmode-v2", className)}>
      <ErrorBoundary>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeRaw, [rehypeSanitize, schema], rehypeKatex]}
          components={{
            p: ({ node, children, ...props }) => {
              const blockTags = ['canvas', 'iframe', 'audio', 'video', 'embed', 'div', 'blockquote', 'table', 'pre', 'script', 'style', 'section', 'button', 'input', 'form', 'details', 'svg'];
              const hasBlock = node.children.some(c => c.type === 'element' && blockTags.includes(c.tagName));
              if (hasBlock) return <div className="mb-10">{children}</div>;
              return <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-8 font-medium" {...props}>{children}</p>;
            },
            h1: (p) => <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-16 mt-24 text-slate-900 dark:text-white leading-[0.9]" {...p} />,
            h2: (p) => <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-10 mt-20 text-slate-900 dark:text-white" {...p} />,
            h3: (p) => <h3 className="text-2xl md:text-3xl font-black tracking-tighter mb-8 mt-12 text-slate-900 dark:text-white" {...p} />,
            code: ({ inline, className, children, ...props }) => {
              if (className === 'language-mermaid') return <div className="mermaid my-12 bg-slate-950/50 p-8 rounded-[2rem] border border-white/5">{children}</div>;
              if (inline) return <code className="bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-lg text-indigo-600 dark:text-indigo-400 font-bold text-sm" {...props}>{children}</code>;
              return (
                <div className="my-12 relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <pre className="relative bg-slate-950 p-10 rounded-[2.5rem] border border-white/5 overflow-x-auto shadow-2xl">
                    <code className={cn("text-sm md:text-lg leading-relaxed text-slate-300", className)} {...props}>{children}</code>
                  </pre>
                </div>
              );
            },
            blockquote: (p) => <blockquote className="border-l-[12px] border-indigo-600 bg-slate-50 dark:bg-white/5 p-10 md:p-16 rounded-[2.5rem] italic text-2xl md:text-4xl font-black text-slate-800 dark:text-slate-100 mb-12 my-12 shadow-xl" {...p} />,
            img: (p) => (
              <div className="my-16">
                <img className="rounded-[3rem] shadow-2xl w-full object-cover max-h-[700px] border border-slate-200 dark:border-slate-800" {...p} alt={p.alt || 'Exhibition'} />
                {p.alt && <p className="text-center text-[10px] font-black text-slate-400 mt-8 uppercase tracking-[0.4em]">{p.alt}</p>}
              </div>
            ),
            script: ({ node, children, ...props }) => (
              <span className="hidden markdown-script-placeholder" data-src={props.src} data-type={props.type} data-async={props.async}>{children}</span>
            ),
            iframe: (p) => (
              <div className="my-16 rounded-[3rem] overflow-hidden border border-slate-200 dark:border-slate-800 aspect-video shadow-2xl">
                <iframe className="w-full h-full" {...p} />
              </div>
            ),
            button: (p) => <button className="px-10 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-500/20" {...p} />,
            a: (p) => <a className="text-indigo-600 dark:text-indigo-400 font-black underline underline-offset-[12px] decoration-4 hover:text-indigo-700 transition-all" {...p} />,
          }}
        >
          {processedContent}
        </ReactMarkdown>
      </ErrorBoundary>
    </div>
  );
}
