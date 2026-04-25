'use client';

import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { cn } from './Badge';

export default function MarkdownRenderer({ content, className }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !content) return;

    // Small delay to ensure React has finished rendering the HTML
    const timer = setTimeout(() => {
      const scripts = containerRef.current.querySelectorAll('script');
      
      scripts.forEach((oldScript) => {
        const newScript = document.createElement('script');
        
        // Copy attributes
        Array.from(oldScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        
        // Copy inline content
        newScript.textContent = oldScript.textContent;
        
        // Replace to trigger
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [content]);

  if (!content) return null;

  return (
    <div 
      ref={containerRef}
      className={cn("markdown-container prose dark:prose-invert max-w-none", className)}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-8 mt-12 text-slate-900 dark:text-white leading-tight" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-6 mt-10 text-slate-900 dark:text-white" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-2xl font-black tracking-tighter mb-4 mt-8 text-slate-900 dark:text-white" {...props} />,
          p: ({ node, ...props }) => <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-6 space-y-2 mb-8 text-base md:text-lg text-slate-600 dark:text-slate-400" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-6 space-y-2 mb-8 text-base md:text-lg text-slate-600 dark:text-slate-400" {...props} />,
          li: ({ node, ...props }) => <li className="pl-2" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-indigo-500 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl italic text-xl font-medium text-slate-700 dark:text-slate-300 mb-8 my-8 border-indigo-200 dark:border-indigo-800" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto mb-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
              <table className="w-full text-left border-collapse text-sm md:text-base" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => <th className="p-4 bg-slate-50 dark:bg-slate-900/50 font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800" {...props} />,
          td: ({ node, ...props }) => <td className="p-4 border-b border-slate-100 dark:border-slate-900 text-slate-600 dark:text-slate-400" {...props} />,
          code: ({ node, inline, className, children, ...props }) => {
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
          img: ({ node, ...props }) => (
            <div className="my-12">
              <img className="rounded-[2.5rem] shadow-2xl w-full object-cover max-h-[600px] border border-slate-200 dark:border-slate-800" {...props} alt={props.alt || 'Exhibition Image'} />
              {props.alt && <p className="text-center text-xs font-black text-slate-400 mt-6 uppercase tracking-[0.3em]">{props.alt}</p>}
            </div>
          ),
          hr: ({ node, ...props }) => <hr className="my-16 border-slate-200 dark:border-slate-800" {...props} />,
          a: ({ node, ...props }) => <a className="text-indigo-600 dark:text-indigo-400 font-bold underline underline-offset-4 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
