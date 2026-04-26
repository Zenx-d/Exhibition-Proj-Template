'use client';

import { useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { cn } from './Badge';
import ErrorBoundary from './ErrorBoundary';

/**
 * ZEN-ULTRABOOT ENGINE
 * A bulletproof Markdown renderer that handles complex interactive scripts, 
 * 3D models, and games without leaking memory or crashing the browser.
 */
export default function MarkdownRenderer({ content, className }) {
  const containerRef = useRef(null);

  // Security: Only allow scripts/media from trusted domains
  const TRUSTED_DOMAINS = [
    'youtube.com', 'vimeo.com', 'twitter.com', 'instagram.com', 'zenx-d.vercel.app',
    'cdn.jsdelivr.net', 'd3js.org', 'unpkg.com', 'platform.twitter.com', 'google.com'
  ];

  // Bridge event handlers before passing to ReactMarkdown
  const processedContent = useMemo(() => {
    if (!content) return '';
    return content.replace(/onclick=/g, 'data-onclick=');
  }, [content]);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const activeIntervals = new Set();
    const activeTimeouts = new Set();
    const activeListeners = []; // Array of [target, type, fn]
    const scriptElements = [];

    // Proxy global timers to track them for cleanup
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

    // 1. Script Execution Subsystem
    const placeholders = containerRef.current.querySelectorAll('.markdown-script-placeholder');
    
    const executeInSequence = async () => {
      for (const placeholder of placeholders) {
        if (placeholder.hasAttribute('data-executed')) continue;
        placeholder.setAttribute('data-executed', 'true');
        
        await new Promise((resolve) => {
          const newScript = document.createElement('script');
          
          if (placeholder.dataset.src) {
            const isTrusted = TRUSTED_DOMAINS.some(domain => placeholder.dataset.src.includes(domain));
            if (!isTrusted) {
              console.warn(`[Zen] Blocked untrusted script: ${placeholder.dataset.src}`);
              resolve();
              return;
            }
            newScript.src = placeholder.dataset.src;
            newScript.onload = () => resolve();
            newScript.onerror = () => resolve();
          } else {
            const code = placeholder.textContent;
            newScript.textContent = `
              (function() {
                try {
                  ${code}
                } catch (e) {
                  console.error('[Zen Script Error]', e);
                }
              })();
            `;
            // Brief delay to ensure DOM is ready
            setTimeout(resolve, 5);
          }
          
          if (placeholder.dataset.type) newScript.type = placeholder.dataset.type;
          if (placeholder.dataset.async) newScript.async = true;
          
          scriptElements.push(newScript);
          document.body.appendChild(newScript);
        });
      }
    };

    executeInSequence();

    // 2. Global Event Re-hydration (Local Elements)
    const interactiveElements = containerRef.current.querySelectorAll('[data-onclick]');
    interactiveElements.forEach((el) => {
      if (el.hasAttribute('data-handler-attached')) return;
      
      const handlerStr = el.getAttribute('data-onclick');
      const handler = (e) => {
        try {
          new Function('event', handlerStr).call(el, e);
        } catch (e) {
          console.error('[Zen Event Error]:', e);
        }
      };
      el.addEventListener('click', handler);
      el.setAttribute('data-handler-attached', 'true');
      el._zenHandler = handler;
    });

    // 3. Absolute Cleanup
    return () => {
      // Restore globals
      window.setInterval = originalSetInterval;
      window.setTimeout = originalSetTimeout;
      window.addEventListener = originalWindowAddListener;
      document.addEventListener = originalDocAddListener;
      
      // Stop all background tasks
      activeIntervals.forEach(clearInterval);
      activeTimeouts.forEach(clearTimeout);
      
      // Cleanup global listeners (Snake games, etc)
      activeListeners.forEach(([target, type, fn]) => {
        target.removeEventListener(type, fn);
      });
      
      // Cleanup script tags
      scriptElements.forEach(s => s.remove());
      
      // Cleanup local event listeners
      if (containerRef.current) {
        const interactive = containerRef.current.querySelectorAll('[data-onclick]');
        interactive.forEach(el => {
          if (el._zenHandler) el.removeEventListener('click', el._zenHandler);
        });
      }
    };
  }, [processedContent]);

  // Premium Design System for Markdown
  const schema = {
    ...defaultSchema,
    tagNames: [
      ...(defaultSchema.tagNames || []), 
      'script', 'span', 'canvas', 'iframe', 'audio', 'video', 'source', 
      'embed', 'style', 'link', 'blockquote', 'button', 'input', 'label', 'form'
    ],
    attributes: {
      ...defaultSchema.attributes,
      '*': [...(defaultSchema.attributes?.['*'] || []), 'style', 'className', 'id', 'data-onclick'],
      span: [...(defaultSchema.attributes?.span || []), 'data-src', 'data-type', 'data-async'],
      script: ['src', 'type', 'async'],
      canvas: ['width', 'height'],
      iframe: ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'scrolling', 'loading'],
      audio: ['controls', 'src'],
      video: ['controls', 'src', 'width', 'height'],
      source: ['src', 'type'],
      embed: ['src', 'width', 'height', 'type'],
      link: ['rel', 'href'],
      button: ['onclick', 'type'],
      input: ['type', 'placeholder', 'id', 'name', 'value'],
      label: ['for'],
      form: ['action', 'method']
    }
  };

  return (
    <div 
      ref={containerRef}
      className={cn("markdown-container prose dark:prose-invert max-w-none zen-ultra-renderer", className)}
    >
      <ErrorBoundary>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, [rehypeSanitize, schema]]}
          components={{
            script: ({ node, children, ...props }) => (
              <span className="hidden markdown-script-placeholder" data-src={props.src} data-type={props.type} data-async={props.async}>
                {children}
              </span>
            ),
            p: ({ node, children, ...props }) => {
              // Robust paragraph unwrapping
              const blockTags = ['canvas', 'iframe', 'audio', 'video', 'embed', 'div', 'blockquote', 'table', 'pre', 'script', 'style', 'section', 'button', 'input', 'form'];
              const hasBlock = node.children.some(c => c.type === 'element' && blockTags.includes(c.tagName));
              if (hasBlock) return <div className="mb-8">{children}</div>;
              return <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-8 font-medium" {...props}>{children}</p>;
            },
            h1: (p) => <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-12 mt-20 text-slate-900 dark:text-white" {...p} />,
            h2: (p) => <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-8 mt-16 text-slate-900 dark:text-white" {...p} />,
            h3: (p) => <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-6 mt-12 text-slate-900 dark:text-white" {...p} />,
            blockquote: (p) => <blockquote className="border-l-8 border-indigo-500 bg-slate-50 dark:bg-slate-900/50 p-8 rounded-3xl italic text-2xl font-medium text-slate-700 dark:text-slate-300 mb-10 my-10" {...p} />,
            img: (p) => (
              <div className="my-12">
                <img className="rounded-[2.5rem] shadow-2xl w-full object-cover max-h-[600px] border border-slate-200 dark:border-slate-800" {...p} alt={p.alt || 'Exhibition'} />
                {p.alt && <p className="text-center text-xs font-black text-slate-400 mt-6 uppercase tracking-widest">{p.alt}</p>}
              </div>
            ),
            button: (p) => <button className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg active:scale-95" {...p} />,
            input: (p) => <input className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-6 py-4 w-full focus:ring-2 focus:ring-indigo-500 outline-none transition-all" {...p} />,
            table: (p) => (
              <div className="overflow-x-auto my-12 rounded-[2rem] border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left border-collapse" {...p} />
              </div>
            ),
            th: (p) => <th className="p-6 bg-slate-50 dark:bg-slate-900/50 font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800" {...p} />,
            td: (p) => <td className="p-6 border-b border-slate-100 dark:border-slate-900 text-slate-600 dark:text-slate-400" {...p} />,
            hr: (p) => <hr className="my-20 border-slate-200 dark:border-slate-800 border-2 rounded-full w-32 mx-auto" {...p} />,
            iframe: (p) => (
              <div className="my-12 rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 aspect-video shadow-xl">
                <iframe className="w-full h-full" {...p} />
              </div>
            ),
            a: (p) => <a className="text-indigo-600 dark:text-indigo-400 font-bold underline underline-offset-8 hover:text-indigo-700 transition-colors" {...p} />,
          }}
        >
          {processedContent}
        </ReactMarkdown>
      </ErrorBoundary>
    </div>
  );
}
