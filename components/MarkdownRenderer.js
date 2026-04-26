'use client';

import { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeKatex from 'rehype-katex';
import hljs from 'highlight.js';
import mermaid from 'mermaid';
import 'highlight.js/styles/github-dark.css';
import 'katex/dist/katex.min.css';
import { cn } from './Badge';
import ErrorBoundary from './ErrorBoundary';

// Initialize Mermaid with a premium dark theme
if (typeof window !== 'undefined') {
  mermaid.initialize({
    startOnLoad: true,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'var(--font-inter)',
  });
}

export default function MarkdownRenderer({ content, className }) {
  const containerRef = useRef(null);

  // 1. ZEN UNIVERSAL ENGINE (WIDGETS, SCRIPTS, & DIAGRAMS)
  useEffect(() => {
    if (!containerRef.current) return;

    const deployUniversalContent = async () => {
      if (!containerRef.current) return;

      // A. Global Zen OS Bus (Inter-widget Communication)
      window.Zen = {
        state: window.Zen?.state || {},
        emit: (event, detail) => window.dispatchEvent(new CustomEvent(`zen:${event}`, { detail })),
        on: (event, fn) => window.addEventListener(`zen:${event}`, (e) => fn(e.detail)),
        notify: (msg) => {
           const toast = document.createElement('div');
           toast.className = "fixed bottom-10 left-1/2 -translate-x-1/2 bg-indigo-600/90 backdrop-blur-xl text-white px-10 py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] z-[9999] shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-500 border border-white/10";
           toast.textContent = msg;
           document.body.appendChild(toast);
           setTimeout(() => { toast.classList.add('animate-out', 'fade-out', 'slide-out-to-bottom-10'); setTimeout(() => toast.remove(), 500); }, 3000);
        }
      };

      // B. Mermaid Rendering
      try {
        await mermaid.run({
          nodes: containerRef.current.querySelectorAll('.mermaid'),
        });
      } catch (e) {
        console.error('Mermaid Render Error:', e);
      }

      // C. Zen Widgets Deployment
      const widgets = containerRef.current.querySelectorAll('[data-zen-widget]');
      widgets.forEach(w => {
        if (w.hasAttribute('data-widget-active')) return;
        const path = w.getAttribute('data-zen-widget');
        const height = w.getAttribute('data-height') || '400';
        if (!path) return;
        const iframe = document.createElement('iframe');
        // Vercel friendly pathing
        iframe.src = `${window.location.origin}/content/widgets/${path}/index.html`;
        iframe.style.width = '100%';
        iframe.style.height = `${height}px`;
        iframe.style.border = 'none';
        iframe.style.borderRadius = '32px';
        iframe.style.display = 'block';
        iframe.style.boxShadow = '0 30px 60px -12px rgba(0,0,0,0.25), 0 18px 36px -18px rgba(0,0,0,0.3)';
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-forms');
        w.innerHTML = '';
        w.appendChild(iframe);
        w.setAttribute('data-widget-active', 'true');
      });

      // D. Executive Script Subsystem
      const placeholders = containerRef.current.querySelectorAll('.markdown-script-placeholder');
      for (const p of placeholders) {
        if (p.hasAttribute('data-executed')) continue;
        p.setAttribute('data-executed', 'true');
        const newScript = document.createElement('script');
        if (p.dataset.src) {
          newScript.src = p.dataset.src;
          if (p.dataset.async) newScript.async = true;
          document.body.appendChild(newScript);
        } else if (p.textContent) {
          newScript.textContent = `(function(){ try { ${p.textContent} } catch(e){ console.error('Zen Logic Error:', e); } })();`;
          document.body.appendChild(newScript);
        }
      }
    };

    deployUniversalContent();
    const timeout = setTimeout(deployUniversalContent, 800);
    const observer = new MutationObserver(deployUniversalContent);
    observer.observe(containerRef.current, { childList: true, subtree: true });

    // E. Syntax Highlighting
    containerRef.current.querySelectorAll('pre code').forEach(block => {
      if (!block.hasAttribute('data-highlighted')) hljs.highlightElement(block);
    });

    return () => { observer.disconnect(); clearTimeout(timeout); };
  }, [content]);

  if (!content) return null;

  // Prop normalization for React/MD hybrid
  const normalizeProps = (rawProps) => {
    const { node, ...props } = rawProps;
    const n = { ...props };
    Object.keys(n).forEach(key => {
      const lk = key.toLowerCase();
      if (lk.startsWith('on') && typeof n[key] === 'string') {
        const code = n[key];
        const rk = lk === 'onclick' ? 'onClick' : 'on' + lk.charAt(2).toUpperCase() + key.slice(3);
        n[rk] = (e) => {
          try { new Function('event', code).call(e.currentTarget || e.target, e); } catch (err) { console.error('Event Error:', err); }
        };
        if (key !== rk) delete n[key];
        delete n[lk];
      }
      if (lk === 'class') { n.className = cn(n.className, n[key]); delete n[key]; }
    });
    return n;
  };

  const schema = {
    ...defaultSchema,
    tagNames: [...(defaultSchema.tagNames || []), 'script', 'span', 'iframe', 'button', 'div', 'i', 'canvas', 'audio', 'video', 'source', 'embed', 'style', 'link', 'blockquote', 'details', 'summary', 'svg', 'path', 'circle'],
    attributes: {
      ...defaultSchema.attributes,
      '*': [...(defaultSchema.attributes?.['*'] || []), 'className', 'id', 'style', 'class', 'onclick', 'onchange', 'data-*', 'aria-*'],
      div: ['data-zen-widget', 'data-height'],
      iframe: ['src', 'width', 'height', 'allow', 'allowfullscreen', 'sandbox'],
    }
  };

  return (
    <div ref={containerRef} className={cn("markdown-container max-w-none zen-universal-engine", className)}>
      <ErrorBoundary>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeRaw, [rehypeSanitize, schema], rehypeKatex]}
          components={{
            p: ({ node, children, ...props }) => {
              const hasBlock = (n) => {
                if (n.type === 'element') {
                  if (['div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'table', 'pre', 'hr', 'canvas', 'audio', 'video', 'embed', 'form', 'svg', 'details', 'iframe', 'script', 'button'].includes(n.tagName)) return true;
                  if (n.tagName === 'div' && n.properties?.dataZenWidget) return true;
                  if (n.tagName === 'code' && !n.properties?.inline) return true;
                }
                return n.children?.some(hasBlock);
              };
              if (node.children?.some(hasBlock)) return <div className="mb-10" {...normalizeProps(props)}>{children}</div>;
              return <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 leading-relaxed mb-12 font-medium" {...normalizeProps(props)}>{children}</p>;
            },
            div: (p) => <div {...normalizeProps(p)} />,
            button: (p) => <button {...normalizeProps(p)} />,
            span: (p) => <span {...normalizeProps(p)} />,
            iframe: (p) => (
              <div className="my-16 rounded-[2.5rem] overflow-hidden border-2 border-slate-200 dark:border-slate-800 aspect-video shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)]">
                <iframe {...normalizeProps(p)} className="w-full h-full" />
              </div>
            ),
            script: ({ node, ...p }) => <span className="hidden markdown-script-placeholder" data-src={p.src} data-type={p.type} data-async={p.async}>{p.children}</span>,
            h1: (p) => <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-16 mt-24 text-slate-900 dark:text-white leading-[0.85] uppercase" {...p} />,
            h2: (p) => <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-10 mt-20 text-slate-900 dark:text-white leading-tight decoration-indigo-500/20 underline underline-offset-8" {...p} />,
            code: ({ inline, className, children, ...p }) => {
              if (className === 'language-mermaid') return <div className="mermaid my-16 bg-slate-900/50 p-10 rounded-[2.5rem] border border-white/5 shadow-inner">{children}</div>;
              const match = /language-(\w+)/.exec(className || '');
              const lang = match ? match[1] : '';
              if (inline) return <code className="bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-lg text-indigo-600 dark:text-indigo-400 font-black text-sm" {...p}>{children}</code>;
              return (
                <div className="group relative font-mono my-16">
                  <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-[3.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  <pre className="relative bg-slate-950 p-10 md:p-14 rounded-[3rem] border border-white/5 overflow-x-auto shadow-2xl">
                    <code className={cn("text-sm md:text-lg leading-relaxed text-slate-300", className, lang && `hljs language-${lang}`)} {...p} dangerouslySetInnerHTML={lang ? { __html: hljs.highlight(String(children).replace(/\n$/, ''), { language: lang }).value } : undefined}>
                      {!lang ? children : undefined}
                    </code>
                  </pre>
                </div>
              );
            },
            blockquote: (p) => <blockquote className="border-l-[16px] border-indigo-600 bg-white dark:bg-white/5 p-12 md:p-20 rounded-[3rem] italic text-3xl md:text-5xl font-black text-slate-800 dark:text-slate-100 mb-16 my-16 shadow-2xl" {...p} />,
            hr: (p) => <hr className="my-32 border-slate-200 dark:border-slate-800 border-[4px] rounded-full w-64 mx-auto opacity-30" {...p} />,
            a: (p) => <a className="text-indigo-600 dark:text-indigo-400 font-black underline underline-offset-[16px] decoration-[4px] hover:decoration-[8px] transition-all" {...p} />,
          }}
        >
          {content}
        </ReactMarkdown>
      </ErrorBoundary>
    </div>
  );
}
