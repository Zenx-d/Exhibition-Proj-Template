'use client';

import { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { cn } from './Badge';
import ErrorBoundary from './ErrorBoundary';

export default function MarkdownRenderer({ content, className }) {
  const containerRef = useRef(null);

  // Re-enable dynamic script execution for custom exhibition widgets
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Find our custom placeholders and turn them back into real scripts
    const placeholders = containerRef.current.querySelectorAll('.markdown-script-placeholder');
    placeholders.forEach((placeholder) => {
      if (placeholder.hasAttribute('data-executed')) return;
      
      const newScript = document.createElement('script');
      
      // Copy all attributes from placeholder (dataset)
      if (placeholder.dataset.src) newScript.src = placeholder.dataset.src;
      if (placeholder.dataset.type) newScript.type = placeholder.dataset.type || 'text/javascript';
      if (placeholder.dataset.async) newScript.async = true;
      
      // Copy inner content
      newScript.textContent = placeholder.textContent;
      
      placeholder.setAttribute('data-executed', 'true');
      document.body.appendChild(newScript);
    });
  }, [content]);

  if (!content) return null;

  return (
    <div 
      ref={containerRef}
      className={cn("markdown-container prose dark:prose-invert max-w-none", className)}
    >
      <ErrorBoundary>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            script: ({ node, ...props }) => {
              // React throws errors for <script> tags in components.
              // We render a hidden placeholder instead, which is then 
              // swapped for a real script by our useEffect.
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
            h1: (props) => <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-8 mt-12 text-slate-900 dark:text-white leading-tight" {...props} />,
            h2: (props) => <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-6 mt-10 text-slate-900 dark:text-white" {...props} />,
            h3: (props) => <h3 className="text-2xl font-black tracking-tighter mb-4 mt-8 text-slate-900 dark:text-white" {...props} />,
            p: (props) => <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6" {...props} />,
            ul: (props) => <ul className="list-disc pl-6 space-y-2 mb-8 text-base md:text-lg text-slate-600 dark:text-slate-400" {...props} />,
            ol: (props) => <ol className="list-decimal pl-6 space-y-2 mb-8 text-base md:text-lg text-slate-600 dark:text-slate-400" {...props} />,
            li: (props) => <li className="pl-2" {...props} />,
            blockquote: (props) => (
              <blockquote className="border-l-4 border-indigo-500 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl italic text-xl font-medium text-slate-700 dark:text-slate-300 mb-8 my-8" {...props} />
            ),
            table: (props) => (
              <div className="overflow-x-auto mb-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                <table className="w-full text-left border-collapse text-sm md:text-base" {...props} />
              </div>
            ),
            th: (props) => <th className="p-4 bg-slate-50 dark:bg-slate-900/50 font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800" {...props} />,
            td: (props) => <td className="p-4 border-b border-slate-100 dark:border-slate-900 text-slate-600 dark:text-slate-400" {...props} />,
            code: ({ inline, className, children, ...props }) => {
              if (inline) {
                return (
                  <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-400 font-bold text-sm" {...props}>
                    {children}
                  </code>
                );
              }
              return (
                <div className="my-8 group relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
                  <pre className="relative bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-sm">
                    <code className={cn("text-sm leading-relaxed text-slate-800 dark:text-slate-200", className)} {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              );
            },
            img: (props) => (
              <div className="my-12">
                <img className="rounded-[2.5rem] shadow-2xl w-full object-cover max-h-[600px] border border-slate-200 dark:border-slate-800" {...props} alt={props.alt || 'Exhibition Image'} />
                {props.alt && <p className="text-center text-xs font-black text-slate-400 mt-6 uppercase tracking-[0.3em]">{props.alt}</p>}
              </div>
            ),
            hr: (props) => <hr className="my-16 border-slate-200 dark:border-slate-800" {...props} />,
            a: (props) => <a className="text-indigo-600 dark:text-indigo-400 font-bold underline underline-offset-4 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all" {...props} />,
          }}
        >
          {content}
        </ReactMarkdown>
      </ErrorBoundary>
    </div>
  );
}
