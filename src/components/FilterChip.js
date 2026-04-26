import { cn } from './Badge';

export default function FilterChip({ label, selected, onClick, className }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
        selected 
          ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" 
          : "bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 ring-1 ring-inset ring-slate-200 dark:ring-slate-700",
        className
      )}
    >
      {label}
    </button>
  );
}
