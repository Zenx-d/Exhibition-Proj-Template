import { cn } from './Badge';

export default function GlassCard({ children, className, ...props }) {
  return (
    <div 
      className={cn(
        "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md",
        "border border-slate-200/50 dark:border-slate-800/50",
        "shadow-xl shadow-slate-200/20 dark:shadow-black/20",
        "rounded-2xl overflow-hidden transition-all duration-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
