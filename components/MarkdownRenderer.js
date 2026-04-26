'use client';

import { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import { cn } from './Badge';
import ErrorBoundary from './ErrorBoundary';

export default function MarkdownRenderer({ content, className }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Restore clobbered IDs and Classes (Tailwind Support)
    const restoreAttributes = () => {
      if (!containerRef.current) return;
      const elements = containerRef.current.querySelectorAll('*');
      elements.forEach(el => {
        // Restore IDs
        if (el.id.startsWith('user-content-')) {
          const realId = el.id.replace('user-content-', '');
          if (!document.getElementById(realId)) el.id = realId;
        }
        // Restore data attributes
        Array.from(el.attributes).forEach(attr => {
          if (attr.name.startsWith('user-content-data-')) {
            const realName = attr.name.replace('user-content-', '');
            el.setAttribute(realName, attr.value);
          }
        });
      });
    };
    restoreAttributes();
    
    // 2. Global Exhibition Utility for Scripts
    window.Exhibition = {
      notify: (msg, type = 'info') => {
        const toast = document.createElement('div');
        toast.className = `fixed bottom-8 right-8 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs z-[9999] animate-slide-up shadow-2xl ${
          type === 'error' ? 'bg-red-600 text-white' : 'bg-indigo-600 text-white'
        }`;
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
      },
      confetti: () => {
        console.log('🎉 Confetti placeholder (Add canvas-confetti if needed)');
      }
    };

    const runScripts = async () => {
      if (!containerRef.current) return;
      const placeholders = containerRef.current.querySelectorAll('.markdown-script-placeholder');
      const scriptsToRun = Array.from(placeholders).filter(p => !p.hasAttribute('data-executed'));
      
      for (const placeholder of scriptsToRun) {
        placeholder.setAttribute('data-executed', 'true');
        const newScript = document.createElement('script');
        const type = placeholder.dataset.type;
        
        if (placeholder.dataset.src) {
          const isTrusted = TRUSTED_DOMAINS.some(domain => placeholder.dataset.src.includes(domain));
          if (!isTrusted) continue;
          newScript.src = placeholder.dataset.src;
          if (type) newScript.type = type;
          if (placeholder.dataset.async) newScript.async = true;
          
          if (!newScript.async) {
            await new Promise((resolve) => {
              newScript.onload = resolve;
              newScript.onerror = resolve;
              document.body.appendChild(newScript);
            });
          } else {
            document.body.appendChild(newScript);
          }
          continue;
        }
        
        if (type) newScript.type = type;
        const scriptContent = placeholder.textContent;
        
        if (scriptContent) {
          if (type === 'importmap') {
            newScript.textContent = scriptContent;
            document.head.appendChild(newScript);
            continue;
          } else if (type === 'module') {
            newScript.textContent = scriptContent;
          } else {
            newScript.textContent = `
              (function() {
                const __run = () => {
                  try {
                    ${scriptContent}
                  } catch (e) {
                    console.warn('Exhibition Engine [Runtime Error]:', e);
                  }
                };
                if (document.readyState === 'complete') {
                  setTimeout(__run, 150);
                } else {
                  window.addEventListener('load', __run);
                }
              })();
            `;
          }
        }
        document.body.appendChild(newScript);
      }
    };

    runScripts();

    // 3. Syntax Highlighting
    containerRef.current.querySelectorAll('pre code').forEach((block) => {
      if (!block.hasAttribute('data-highlighted')) {
        hljs.highlightElement(block);
      }
    });
  }, [content]);

  const TRUSTED_DOMAINS = [
    'youtube.com', 'vimeo.com', 'twitter.com', 'instagram.com', 
    'zenx-d.vercel.app', 'cdn.jsdelivr.net', 'unpkg.com', 
    'd3js.org', 'cdnjs.cloudflare.com', 'platform.twitter.com',
    'gist.github.com', 'codepen.io', 'stackblitz.com', 'openstreetmap.org',
    'player.vimeo.com', 'open.spotify.com'
  ];

  // Permissive Goated Schema
  const schema = {
    ...defaultSchema,
    tagNames: [
      ...(defaultSchema.tagNames || []), 
      'script', 'span', 'iframe', 'button', 'div', 'i', 'canvas', 
      'audio', 'video', 'source', 'embed', 'style', 'link', 'blockquote',
      'section', 'article', 'footer', 'header', 'main', 'nav',
      'form', 'input', 'label', 'select', 'option', 'textarea',
      'svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse', 'text', 'g', 'defs', 'linearGradient', 'stop',
      'details', 'summary', 'abbr', 'address', 'cite', 'data', 'dfn', 'mark', 'q', 's', 'samp', 'small', 'sub', 'sup', 'time', 'var'
    ],
    attributes: {
      ...defaultSchema.attributes,
      '*': [
        ...(defaultSchema.attributes?.['*'] || []), 
        'className', 'id', 'style', 'class', 
        'onclick', 'onchange', 'oninput', 'onsubmit', 'onmouseover', 'onmouseout', 'onload', 'onerror',
        'data-*', 'aria-*'
      ],
      span: [...(defaultSchema.attributes?.span || []), 'data-src', 'data-type', 'data-async'],
      script: ['src', 'type', 'async', 'charset'],
      iframe: ['src', 'width', 'height', 'allow', 'allowfullscreen', 'loading', 'className', 'frameborder', 'scrolling'],
      button: ['id', 'className', 'onclick', 'style', 'type', 'disabled'],
      canvas: ['id', 'width', 'height', 'style', 'className'],
      audio: ['controls', 'autoplay', 'loop', 'muted', 'src', 'style', 'className'],
      video: ['controls', 'autoplay', 'loop', 'muted', 'src', 'poster', 'width', 'height', 'style', 'className', 'playsinline'],
      source: ['src', 'type', 'media'],
      embed: ['src', 'type', 'width', 'height', 'style', 'className'],
      link: ['rel', 'href', 'type', 'as', 'crossorigin', 'media'],
      form: ['action', 'method', 'target', 'id', 'className', 'style', 'onsubmit'],
      input: ['type', 'value', 'name', 'placeholder', 'id', 'className', 'style', 'checked', 'required', 'min', 'max', 'step', 'onchange', 'oninput'],
      textarea: ['name', 'placeholder', 'id', 'className', 'style', 'required', 'rows', 'cols'],
      select: ['name', 'id', 'className', 'style', 'required', 'multiple', 'onchange'],
      svg: ['viewBox', 'width', 'height', 'fill', 'stroke', 'xmlns', 'id', 'className', 'style'],
      path: ['d', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin'],
      circle: ['cx', 'cy', 'r', 'fill', 'stroke'],
      rect: ['x', 'y', 'width', 'height', 'rx', 'ry', 'fill', 'stroke'],
      // Add more as needed for the ultimate engine
    }
  };

  if (!content) return null;

  return (
    <div 
      ref={containerRef}
      className={cn("markdown-container max-w-none exhibition-engine-root", className)}
    >
      <ErrorBoundary>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, [rehypeSanitize, schema]]}
          components={{
            script: ({ node, ...props }) => {
              return (
                <span 
                  className="hidden markdown-script-placeholder" 
                  data-src={props.src}
                  data-type={props.type}
                  data-async={props.async}
                >
                  {props.children}
                </span>
              );
            },
            h1: (props) => <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-12 mt-20 text-slate-900 dark:text-white leading-[0.9] decoration-indigo-500/30 underline underline-offset-8" {...props} />,
            h2: (props) => <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 mt-16 text-slate-900 dark:text-white leading-tight" {...props} />,
            h3: (props) => <h3 className="text-3xl md:text-4xl font-black tracking-tighter mb-6 mt-12 text-slate-900 dark:text-white" {...props} />,
            p: ({ node, children, ...props }) => {
              const checkBlock = (n) => {
                if (n.type === 'element' && [
                  'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'table', 'pre', 'hr', 
                  'iframe', 'section', 'article', 'canvas', 'audio', 'video', 'embed', 'footer', 'header', 
                  'main', 'nav', 'style', 'form', 'svg', 'details'
                ].includes(n.tagName)) return true;
                if (n.children) return n.children.some(checkBlock);
                return false;
              };
              if (node.children.some(checkBlock)) return <div className="mb-8">{children}</div>;
              return <p className="text-lg md:text-2xl text-slate-600 dark:text-slate-400 leading-relaxed mb-10 font-medium" {...props}>{children}</p>;
            },
            blockquote: (props) => (
              <blockquote className="border-l-[12px] border-indigo-600 bg-slate-50 dark:bg-slate-900/50 p-10 md:p-16 rounded-[2.5rem] italic text-2xl md:text-4xl font-black text-slate-800 dark:text-slate-100 mb-12 my-12 shadow-2xl shadow-indigo-500/10" {...props} />
            ),
            pre: (props) => <div className="my-12" {...props} />,
            code: ({ inline, className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || '');
              const lang = match ? match[1] : '';
              if (inline) {
                return <code className="bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-lg text-indigo-600 dark:text-indigo-400 font-black text-sm" {...props}>{children}</code>;
              }
              return (
                <div className="group relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <pre className="relative bg-slate-950 p-8 md:p-12 rounded-[2.5rem] border border-slate-800 overflow-x-auto shadow-2xl overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/20" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                      <div className="w-3 h-3 rounded-full bg-green-500/20" />
                    </div>
                    <code className={cn("text-sm md:text-lg leading-relaxed text-slate-300 font-mono", className, lang && `hljs language-${lang}`)} {...props}
                      dangerouslySetInnerHTML={lang ? { __html: hljs.highlight(String(children).replace(/\n$/, ''), { language: lang }).value } : undefined}
                    >
                      {!lang ? children : undefined}
                    </code>
                  </pre>
                  {lang && <div className="absolute bottom-6 right-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-700 group-hover:text-indigo-500 transition-colors">{lang}</div>}
                </div>
              );
            },
            img: (props) => (
              <div className="my-20 group">
                <div className="relative rounded-[3rem] md:rounded-[5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border border-slate-200 dark:border-slate-800">
                  <img className="w-full object-cover max-h-[800px] transition-transform duration-1000 group-hover:scale-110" {...props} alt={props.alt || 'Exhibition View'} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                {props.alt && <p className="text-center text-[11px] font-black text-slate-400 mt-10 uppercase tracking-[0.5em]">{props.alt}</p>}
              </div>
            ),
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

