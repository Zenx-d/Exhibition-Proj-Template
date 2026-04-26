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
 * ZEN-ULTRA-CORE v3.0
 * The definitive Markdown Engine for Zen Exhibition.
 * Completely rebuilt from scratch for maximum reliability, security, and performance.
 */
export default function MarkdownRenderer({ content, className }) {
  const containerRef = useRef(null);

  // 1. Security Configuration
  const TRUSTED_DOMAINS = [
    'youtube.com', 'vimeo.com', 'twitter.com', 'instagram.com', 'zenx-d.vercel.app',
    'cdn.jsdelivr.net', 'd3js.org', 'unpkg.com', 'platform.twitter.com', 'google.com',
    'player.vimeo.com', 'www.youtube.com', 'spotify.com', 'soundcloud.com'
  ];

  // 2. Content Pre-Processor (Sizing & Normalization)
  const processedContent = useMemo(() => {
    if (!content) return '';
    // Normalize onclick for React hydration
    return content.replace(/onclick=/g, 'data-onclick=');
  }, [content]);

  useEffect(() => {
    if (!containerRef.current) return;

    // 3. Lifecycle Registry (Timer & Listener tracking)
    const registry = {
      intervals: new Set(),
      timeouts: new Set(),
      listeners: [],
      scripts: []
    };

    // Proxy Timers
    const _setInterval = window.setInterval;
    const _setTimeout = window.setTimeout;
    const _addEventListener = window.addEventListener;
    const _docAddEventListener = document.addEventListener;

    window.setInterval = (...args) => {
      const id = _setInterval(...args);
      registry.intervals.add(id);
      return id;
    };
    window.setTimeout = (...args) => {
      const id = _setTimeout(...args);
      registry.timeouts.add(id);
      return id;
    };
    window.addEventListener = (type, fn, options) => {
      registry.listeners.push([window, type, fn]);
      return _addEventListener.call(window, type, fn, options);
    };
    document.addEventListener = (type, fn, options) => {
      registry.listeners.push([document, type, fn]);
      return _docAddEventListener.call(document, type, fn, options);
    };

    // 4. Engine Core Deployment
    const deploy = async () => {
      if (!containerRef.current) return;

      // A. Mermaid Diagrams
      const diagrams = containerRef.current.querySelectorAll('.mermaid');
      if (diagrams.length > 0) {
        mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' });
        await mermaid.run({ nodes: diagrams });
      }

      // B. Dynamic Script Execution
      const scripts = containerRef.current.querySelectorAll('.zen-script-placeholder');
      for (const s of scripts) {
        if (s.dataset.executed) continue;
        s.dataset.executed = 'true';
        
        const el = document.createElement('script');
        if (s.dataset.src) {
          if (!TRUSTED_DOMAINS.some(d => s.dataset.src.includes(d))) continue;
          el.src = s.dataset.src;
          if (s.dataset.async) el.async = true;
        } else {
          el.textContent = `(function(){ try { ${s.textContent} } catch(e){ console.error('Zen Logic Error:', e); } })();`;
        }
        registry.scripts.push(el);
        document.body.appendChild(el);
      }

      // C. Widget & Iframe Re-hydration
      const widgets = containerRef.current.querySelectorAll('[data-zen-widget]');
      widgets.forEach(w => {
        if (w.dataset.active) return;
        w.dataset.active = 'true';
        const path = w.getAttribute('data-zen-widget');
        const height = w.getAttribute('data-height') || '450';
        const iframe = document.createElement('iframe');
        iframe.src = `${window.location.origin}/content/widgets/${path}/index.html`;
        iframe.className = "w-full h-full border-none rounded-[2rem] shadow-2xl";
        iframe.style.height = `${height}px`;
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups');
        w.innerHTML = '';
        w.appendChild(iframe);
      });

      // D. Interactive Event Handlers
      containerRef.current.querySelectorAll('[data-onclick]').forEach(el => {
        if (el.dataset.handlerActive) return;
        el.dataset.handlerActive = 'true';
        const code = el.getAttribute('data-onclick');
        const handler = (e) => { try { new Function('event', code).call(el, e); } catch (err) { console.error('Zen Event Error:', err); } };
        el.addEventListener('click', handler);
        el._zenHandler = handler;
      });
    };

    // Initial deployment
    deploy();

    // 5. Mutation Observer (Continuous Re-hydration)
    const observer = new MutationObserver(deploy);
    observer.observe(containerRef.current, { childList: true, subtree: true });

    // 6. Final Cleanup Protocol
    return () => {
      observer.disconnect();
      window.setInterval = _setInterval;
      window.setTimeout = _setTimeout;
      window.addEventListener = _addEventListener;
      document.addEventListener = _docAddEventListener;

      registry.intervals.forEach(clearInterval);
      registry.timeouts.forEach(clearTimeout);
      registry.listeners.forEach(([target, type, fn]) => target.removeEventListener(type, fn));
      registry.scripts.forEach(s => s.remove());
      
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
      'script', 'span', 'canvas', 'iframe', 'audio', 'video', 'source', 'embed', 
      'style', 'link', 'blockquote', 'button', 'input', 'label', 'form', 'details', 
      'summary', 'svg', 'path', 'circle', 'math', 'annotation'
    ],
    attributes: {
      ...defaultSchema.attributes,
      '*': [...(defaultSchema.attributes?.['*'] || []), 'style', 'className', 'id', 'data-onclick', 'data-*'],
      iframe: ['src', 'width', 'height', 'allow', 'allowfullscreen', 'sandbox', 'frameborder', 'loading'],
      div: ['data-zen-widget', 'data-height'],
    }
  };

  return (
    <div ref={containerRef} className={cn("markdown-container max-w-none zen-ultra-v3", className)}>
      <ErrorBoundary>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeRaw, [rehypeSanitize, schema], rehypeKatex]}
          components={{
            // Typography (Slightly Smaller Sizing per request)
            p: ({ node, children, ...props }) => {
              const blockTags = ['canvas', 'iframe', 'audio', 'video', 'embed', 'div', 'blockquote', 'table', 'pre', 'script', 'style', 'section', 'button', 'input', 'form', 'details', 'svg'];
              const hasBlock = node.children.some(c => c.type === 'element' && blockTags.includes(c.tagName));
              if (hasBlock) return <div className="mb-6">{children}</div>;
              return <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-6 font-medium" {...props}>{children}</p>;
            },
            h1: (p) => <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-10 mt-14 text-slate-900 dark:text-white leading-[0.9]" {...p} />,
            h2: (p) => <h2 className="text-2xl md:text-3xl font-black tracking-tighter mb-6 mt-10 text-slate-900 dark:text-white" {...p} />,
            h3: (p) => <h3 className="text-lg md:text-xl font-black tracking-tighter mb-4 mt-6 text-slate-900 dark:text-white" {...p} />,
            
            // Specialized Containers
            div: ({ node, ...props }) => {
              if (props['data-zen-widget']) return <div className="my-12 w-full bg-slate-100 dark:bg-slate-900/50 rounded-[2.5rem] overflow-hidden" {...props} />;
              return <div {...props} />;
            },
            script: ({ node, children, ...props }) => (
              <span className="hidden zen-script-placeholder" data-src={props.src} data-type={props.type} data-async={props.async}>{children}</span>
            ),
            
            // Code & Diagrams
            code: ({ inline, className, children, ...props }) => {
              if (className === 'language-mermaid') return <div className="mermaid my-10 bg-slate-950/50 p-6 rounded-[2rem] border border-white/5">{children}</div>;
              if (inline) return <code className="bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-lg text-indigo-600 dark:text-indigo-400 font-bold text-sm" {...props}>{children}</code>;
              return (
                <div className="my-10 relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <pre className="relative bg-slate-950 p-8 rounded-[2rem] border border-white/5 overflow-x-auto shadow-2xl">
                    <code className={cn("text-sm md:text-base leading-relaxed text-slate-300", className)} {...props}>{children}</code>
                  </pre>
                </div>
              );
            },

            // Visuals
            img: (p) => (
              <div className="my-12">
                <img className="rounded-[2.5rem] shadow-2xl w-full object-cover max-h-[600px] border border-slate-200 dark:border-slate-800" {...p} alt={p.alt || 'Exhibition'} />
                {p.alt && <p className="text-center text-[9px] font-black text-slate-400 mt-6 uppercase tracking-[0.4em]">{p.alt}</p>}
              </div>
            ),
            iframe: (p) => (
              <div className="my-12 rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 aspect-video shadow-2xl">
                <iframe className="w-full h-full" {...p} />
              </div>
            ),
            
            // Interactive
            button: (p) => <button className="px-8 py-4 bg-indigo-600 text-white rounded-[1.2rem] font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-xl" {...p} />,
            a: (p) => <a className="text-indigo-600 dark:text-indigo-400 font-black underline underline-offset-[8px] decoration-2 hover:text-indigo-700 transition-all" {...p} />,
            blockquote: (p) => <blockquote className="border-l-[10px] border-indigo-600 bg-slate-50 dark:bg-white/5 p-8 md:p-12 rounded-[2rem] italic text-xl md:text-3xl font-black text-slate-800 dark:text-slate-100 mb-10 my-10" {...p} />,
          }}
        >
          {processedContent}
        </ReactMarkdown>
      </ErrorBoundary>
    </div>
  );
}
