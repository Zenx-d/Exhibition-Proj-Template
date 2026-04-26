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

    // 1. LIGHTWEIGHT ATTRIBUTE RESTORATION
    // Still needed for Tailwind classes used directly in MD HTML
    const fixAttributes = (root) => {
      const elements = root.querySelectorAll('*');
      elements.forEach(el => {
        if (el.id?.startsWith('user-content-')) {
          el.id = el.id.replace('user-content-', '');
        }
        Array.from(el.attributes).forEach(attr => {
          if (attr.name.startsWith('user-content-')) {
            const realName = attr.name.replace('user-content-', '');
            if (realName === 'class' || realName === 'classname') {
              el.setAttribute('class', attr.value);
            } else {
              el.setAttribute(realName, attr.value);
            }
          }
        });
      });
    };
    fixAttributes(containerRef.current);

    // 2. ZEN WIDGET HANDLER
    // Automatically swaps <div data-zen-widget="..."> for a sandboxed iframe
    const loadWidgets = () => {
      if (!containerRef.current) return;
      const widgets = containerRef.current.querySelectorAll('[data-zen-widget]');
      widgets.forEach(w => {
        if (w.hasAttribute('data-loaded')) return;
        const widgetPath = w.getAttribute('data-zen-widget');
        const height = w.getAttribute('data-height') || '400';
        
        const iframe = document.createElement('iframe');
        iframe.src = `/content/widgets/${widgetPath}/index.html`;
        iframe.style.width = '100%';
        iframe.style.height = `${height}px`;
        iframe.style.border = 'none';
        iframe.style.borderRadius = '24px';
        iframe.style.display = 'block';
        iframe.style.background = 'transparent';
        iframe.setAttribute('loading', 'lazy');
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups');
        
        w.innerHTML = '';
        w.appendChild(iframe);
        w.setAttribute('data-loaded', 'true');
        w.style.margin = '40px 0';
      });
    };
    loadWidgets();

    // 3. SYNTAX HIGHLIGHTING
    containerRef.current.querySelectorAll('pre code').forEach((block) => {
      if (!block.hasAttribute('data-highlighted')) {
        hljs.highlightElement(block);
      }
    });

  }, [content]);

  // Permissive but secure schema for widgets and standard MD
  const schema = {
    ...defaultSchema,
    tagNames: [...(defaultSchema.tagNames || []), 'div', 'span', 'i', 'button', 'blockquote', 'section', 'article', 'style', 'details', 'summary'],
    attributes: {
      ...defaultSchema.attributes,
      '*': [...(defaultSchema.attributes?.['*'] || []), 'className', 'id', 'style', 'class', 'data-*', 'aria-*'],
      div: ['data-zen-widget', 'data-height'],
    }
  };

  if (!content) return null;

  return (
    <div 
      ref={containerRef}
      className={cn("markdown-container max-w-none zen-engine-root", className)}
    >
      <ErrorBoundary>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, [rehypeSanitize, schema]]}
          components={{
            // ROBUST Paragraph: Converts to div if block elements are nested
            p: ({ node, children }) => {
              const hasBlock = (n) => {
                if (n.type === 'element') {
                  if (['div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'table', 'pre', 'hr', 'section', 'article', 'footer', 'header', 'main', 'nav', 'style', 'form', 'svg', 'details'].includes(n.tagName)) return true;
                  if (n.tagName === 'div' && n.properties?.dataZenWidget) return true;
                }
                return n.children?.some(hasBlock);
              };
              if (node.children?.some(hasBlock)) return <div className="mb-8">{children}</div>;
              return <p className="text-lg md:text-2xl text-slate-600 dark:text-slate-400 leading-relaxed mb-10 font-medium">{children}</p>;
            },
            h1: (props) => <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-12 mt-20 text-slate-900 dark:text-white leading-[0.9] decoration-indigo-500/30 underline underline-offset-8" {...props} />,
            h2: (props) => <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 mt-16 text-slate-900 dark:text-white leading-tight" {...props} />,
            h3: (props) => <h3 className="text-3xl md:text-4xl font-black tracking-tighter mb-6 mt-12 text-slate-900 dark:text-white" {...props} />,
            blockquote: (props) => <blockquote className="border-l-[12px] border-indigo-600 bg-slate-50 dark:bg-slate-900/50 p-10 md:p-16 rounded-[2.5rem] italic text-2xl md:text-4xl font-black text-slate-800 dark:text-slate-100 mb-12 my-12 shadow-2xl shadow-indigo-500/10" {...props} />,
            pre: (props) => <div className="my-12" {...props} />,
            code: ({ inline, className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || '');
              const lang = match ? match[1] : '';
              if (inline) return <code className="bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-lg text-indigo-600 dark:text-indigo-400 font-black text-sm" {...props}>{children}</code>;
              return (
                <div className="group relative font-mono">
                  <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <pre className="relative bg-slate-950 p-8 md:p-12 rounded-[2.5rem] border border-slate-800 overflow-x-auto shadow-2xl overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/20" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                      <div className="w-3 h-3 rounded-full bg-green-500/20" />
                    </div>
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
