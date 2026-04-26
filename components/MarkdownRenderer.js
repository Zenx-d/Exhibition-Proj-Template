'use client';

import { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import { cn } from './Badge';
import ErrorBoundary from './ErrorBoundary';

export default function MarkdownRenderer({ content, className }) {
  const containerRef = useRef(null);

  // 1. ZEN CONTENT ENGINE (WIDGETS & SCRIPTS)
  useEffect(() => {
    if (!containerRef.current) return;

    const deployContent = async () => {
      if (!containerRef.current) return;

      // A. Deploy Zen Widgets
      const widgets = containerRef.current.querySelectorAll('[data-zen-widget]');
      widgets.forEach(w => {
        if (w.hasAttribute('data-widget-active')) return;
        const path = w.getAttribute('data-zen-widget');
        const height = w.getAttribute('data-height') || '400';
        if (!path) return;
        const iframe = document.createElement('iframe');
        iframe.src = `/content/widgets/${path}/index.html`;
        iframe.style.width = '100%';
        iframe.style.height = `${height}px`;
        iframe.style.border = 'none';
        iframe.style.borderRadius = '24px';
        iframe.style.display = 'block';
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-forms');
        w.innerHTML = '';
        w.appendChild(iframe);
        w.setAttribute('data-widget-active', 'true');
      });

      // B. Execute Raw Scripts
      const placeholders = containerRef.current.querySelectorAll('.markdown-script-placeholder');
      for (const p of placeholders) {
        if (p.hasAttribute('data-executed')) continue;
        p.setAttribute('data-executed', 'true');
        const newScript = document.createElement('script');
        if (p.dataset.src) {
          const isTrusted = TRUSTED_DOMAINS.some(d => p.dataset.src.includes(d));
          if (!isTrusted) continue;
          newScript.src = p.dataset.src;
          if (p.dataset.async) newScript.async = true;
          document.body.appendChild(newScript);
        } else if (p.textContent) {
          // Robust script execution in global scope
          newScript.textContent = `(function(){\ntry{\n${p.textContent}\n}catch(e){console.warn('Zen Script Error:', e);}\n})();`;
          document.body.appendChild(newScript);
        }
      }
    };

    deployContent();
    const timeout = setTimeout(deployContent, 800); // Second pass for safe hydration

    const observer = new MutationObserver(() => {
      deployContent();
    });
    observer.observe(containerRef.current, { childList: true, subtree: true });

    // Highlighting
    containerRef.current.querySelectorAll('pre code').forEach(block => {
      if (!block.hasAttribute('data-highlighted')) hljs.highlightElement(block);
    });

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [content]);

  if (!content) return null;

  // 2. THE ULTIMATE PROP FIXER (Converts raw HTML attributes to React Props)
  const fixProps = (rawProps) => {
    const { node, ...props } = rawProps;
    const cleanProps = { ...props };
    
    Object.keys(cleanProps).forEach(key => {
      const lowerKey = key.toLowerCase();
      
      // Fix Event Handlers (satisfies React & makes them work)
      if (lowerKey.startsWith('on') && typeof cleanProps[key] === 'string') {
        const code = cleanProps[key];
        const reactKey = lowerKey === 'onclick' ? 'onClick' : 
                         lowerKey === 'onchange' ? 'onChange' :
                         lowerKey === 'oninput' ? 'onInput' :
                         lowerKey === 'onsubmit' ? 'onSubmit' :
                         lowerKey === 'onmouseover' ? 'onMouseOver' :
                         lowerKey === 'onmouseout' ? 'onMouseOut' :
                         'on' + lowerKey.charAt(2).toUpperCase() + key.slice(3);
        
        cleanProps[reactKey] = (e) => {
          try {
            // eslint-disable-next-line no-new-func
            const fn = new Function('event', code);
            fn.call(e.currentTarget || e.target || window, e);
          } catch (err) {
            console.error(`Zen Event Error [${key}]:`, err);
          }
        };
        
        // CRITICAL: Delete original string to stop React errors
        if (key !== reactKey) delete cleanProps[key];
        delete cleanProps[lowerKey];
      }
      
      // Map Class to className
      if (lowerKey === 'class') {
        cleanProps.className = cn(cleanProps.className, cleanProps[key]);
        delete cleanProps[key];
      }

      // Map for to htmlFor
      if (lowerKey === 'for') {
        cleanProps.htmlFor = cleanProps[key];
        delete cleanProps[key];
      }
    });

    return cleanProps;
  };

  const TRUSTED_DOMAINS = [
    'youtube.com', 'vimeo.com', 'twitter.com', 'instagram.com', 'cdn.jsdelivr.net', 
    'unpkg.com', 'd3js.org', 'cdnjs.cloudflare.com', 'platform.twitter.com', 'open.spotify.com'
  ];

  return (
    <div ref={containerRef} className={cn("markdown-container max-w-none zen-engine-ultimate", className)}>
      <ErrorBoundary>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            // HYDRATION & PROP GUARD
            p: ({ node, children, ...props }) => {
              const checkBlock = (n) => {
                if (n.type === 'element') {
                  if (['div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'table', 'pre', 'hr', 'canvas', 'audio', 'video', 'embed', 'form', 'svg', 'details', 'iframe', 'script', 'button', 'input', 'select', 'textarea'].includes(n.tagName)) return true;
                  if (n.tagName === 'div' && n.properties?.dataZenWidget) return true;
                }
                return n.children?.some(checkBlock);
              };
              if (node.children?.some(checkBlock)) return <div className="mb-8" {...fixProps(props)}>{children}</div>;
              return <p className="text-lg md:text-2xl text-slate-600 dark:text-slate-400 leading-relaxed mb-10 font-medium" {...fixProps(props)}>{children}</p>;
            },
            // INTERACTIVE TAG OVERRIDES
            div: (p) => <div {...fixProps(p)} />,
            button: (p) => <button {...fixProps(p)} />,
            span: (p) => <span {...fixProps(p)} />,
            input: (p) => <input {...fixProps(p)} />,
            canvas: (p) => <canvas {...fixProps(p)} />,
            iframe: (p) => (
              <div className="my-10 rounded-[2rem] overflow-hidden border-2 border-slate-200 dark:border-slate-800 aspect-video shadow-2xl">
                <iframe {...fixProps(p)} className="w-full h-full" />
              </div>
            ),
            // SCRIPT PLACEHOLDER
            script: ({ node, ...props }) => (
              <span className="hidden markdown-script-placeholder" data-src={props.src} data-type={props.type} data-async={props.async}>{props.children}</span>
            ),
            // PREMIUM STYLING
            h1: (props) => <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-12 mt-20 text-slate-900 dark:text-white leading-[0.9] decoration-indigo-500/30 underline underline-offset-8" {...props} />,
            h2: (props) => <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 mt-16 text-slate-900 dark:text-white leading-tight" {...props} />,
            h3: (props) => <h3 className="text-3xl md:text-4xl font-black tracking-tighter mb-6 mt-12 text-slate-900 dark:text-white" {...props} />,
            code: ({ inline, className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || '');
              const lang = match ? match[1] : '';
              if (inline) return <code className="bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-lg text-indigo-600 dark:text-indigo-400 font-black text-sm" {...props}>{children}</code>;
              return (
                <div className="group relative font-mono">
                  <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <pre className="relative bg-slate-950 p-8 md:p-12 rounded-[2.5rem] border border-slate-800 overflow-x-auto shadow-2xl overflow-hidden">
                    <code className={cn("text-sm md:text-lg leading-relaxed text-slate-300", className, lang && `hljs language-${lang}`)} {...props} dangerouslySetInnerHTML={lang ? { __html: hljs.highlight(String(children).replace(/\n$/, ''), { language: lang }).value } : undefined}>
                      {!lang ? children : undefined}
                    </code>
                  </pre>
                  {lang && <div className="absolute bottom-6 right-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-700 group-hover:text-indigo-500 transition-colors">{lang}</div>}
                </div>
              );
            },
            hr: (props) => <hr className="my-24 border-slate-200 dark:border-slate-800 border-[3px] rounded-full w-48 mx-auto opacity-50" {...props} />,
            a: (props) => <a className="text-indigo-600 dark:text-indigo-400 font-black underline underline-offset-[12px] decoration-[3px] hover:decoration-[6px] transition-all" {...props} />,
          }}
        >
          {content}
        </ReactMarkdown>
      </ErrorBoundary>
    </div>
  );
}
