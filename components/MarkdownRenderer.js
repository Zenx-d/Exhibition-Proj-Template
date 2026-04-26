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

  // THE TOTAL EXECUTION ENGINE
  useEffect(() => {
    if (!containerRef.current) return;

    const deployContent = async () => {
      if (!containerRef.current) return;

      // 1. ZEN WIDGET DEPLOYMENT
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

      // 2. RAW SCRIPT EXECUTION
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
          newScript.textContent = `\n(function(){\ntry{\n${p.textContent}\n}catch(e){console.error(e);}\n})();\n`;
          document.body.appendChild(newScript);
        }
      }
    };

    deployContent();
    const timeout = setTimeout(deployContent, 300);

    const observer = new MutationObserver(deployContent);
    observer.observe(containerRef.current, { childList: true, subtree: true });

    // 3. HIGHLIGHTING
    containerRef.current.querySelectorAll('pre code').forEach(block => {
      if (!block.hasAttribute('data-highlighted')) hljs.highlightElement(block);
    });

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [content]);

  if (!content) return null;

  // Helper to handle raw event handlers like onclick and attributes like class
  const wrapRawProps = (props) => {
    const newProps = { ...props };
    
    // Map of HTML attributes to React props
    const attrMap = {
      'onclick': 'onClick',
      'onchange': 'onChange',
      'oninput': 'onInput',
      'onsubmit': 'onSubmit',
      'onmouseover': 'onMouseOver',
      'onmouseout': 'onMouseOut',
      'onkeydown': 'onKeyDown',
      'onkeyup': 'onKeyUp',
      'class': 'className',
      'for': 'htmlFor'
    };
    
    Object.keys(attrMap).forEach(attr => {
      if (typeof newProps[attr] === 'string') {
        const val = newProps[attr];
        const reactProp = attrMap[attr];
        
        if (attr.startsWith('on')) {
          // Convert string to executable function
          newProps[reactProp] = (e) => {
            try {
              // eslint-disable-next-line no-new-func
              const fn = new Function('event', val);
              fn.call(e.target, e);
            } catch (err) {
              console.error(`Zen Engine Event Error [${attr}]:`, err);
            }
          };
        } else if (attr === 'class') {
          newProps[reactProp] = cn(newProps[reactProp], val);
        } else {
          newProps[reactProp] = val;
        }
        
        // Always remove the raw lowercase/HTML-style attribute to prevent React errors
        delete newProps[attr];
      }
    });

    // Strip any other properties that start with 'on' but are strings
    Object.keys(newProps).forEach(key => {
      if (key.startsWith('on') && typeof newProps[key] === 'string') {
        delete newProps[key];
      }
    });

    return newProps;
  };

  return (
    <div ref={containerRef} className={cn("markdown-container max-w-none zen-engine-final", className)}>
      <ErrorBoundary>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            // HYDRATION GUARD & PROPS WRAPPER
            p: ({ node, children, ...props }) => {
              const checkBlock = (n) => {
                if (n.type === 'element') {
                  if (['div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'table', 'pre', 'hr', 'canvas', 'audio', 'video', 'embed', 'form', 'svg', 'details', 'iframe', 'script', 'button', 'input', 'select', 'textarea'].includes(n.tagName)) return true;
                }
                return n.children?.some(checkBlock);
              };
              if (node.children?.some(checkBlock)) return <div className="mb-8" {...wrapRawProps(props)}>{children}</div>;
              return <p className="text-lg md:text-2xl text-slate-600 dark:text-slate-400 leading-relaxed mb-10 font-medium" {...wrapRawProps(props)}>{children}</p>;
            },
            // INTERACTIVE TAGS
            div: ({ node, ...props }) => <div {...wrapRawProps(props)} />,
            button: ({ node, ...props }) => <button {...wrapRawProps(props)} />,
            span: ({ node, ...props }) => <span {...wrapRawProps(props)} />,
            input: ({ node, ...props }) => <input {...wrapRawProps(props)} />,
            canvas: ({ node, ...props }) => <canvas {...wrapRawProps(props)} />,
            section: ({ node, ...props }) => <section {...wrapRawProps(props)} />,
            article: ({ node, ...props }) => <article {...wrapRawProps(props)} />,
            // SCRIPT PLACEHOLDER
            script: ({ node, ...props }) => (
              <span className="hidden markdown-script-placeholder" data-src={props.src} data-type={props.type} data-async={props.async}>{props.children}</span>
            ),
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
