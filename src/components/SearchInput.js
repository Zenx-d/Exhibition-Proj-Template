import { Search } from 'lucide-react';
import { cn } from './Badge';

export default function SearchInput({ value, onChange, placeholder = "Search...", className }) {
  return (
    <div className={cn("relative group", className)}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        className="block w-full rounded-xl border-0 py-2.5 pl-10 pr-3 bg-white/50 dark:bg-slate-800/50 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6 backdrop-blur-sm transition-all"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
