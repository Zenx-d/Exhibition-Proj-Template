import { marked } from 'marked';
import hljs from 'highlight.js';

// Configure marked to use highlight.js for code blocks
marked.setOptions({
  highlight: function (code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'hljs language-',
  gfm: true,
  breaks: true,
  pedantic: false,
  smartLists: true,
  smartypants: true,
  headerIds: true,
  mangle: false
});

export function parseMarkdown(markdownString) {
  if (!markdownString) return '';
  // Zero sanitization applied to allow full HTML support (iframes, scripts, styles)
  return marked.parse(markdownString);
}
