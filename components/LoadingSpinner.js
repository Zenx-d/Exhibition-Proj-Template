import { Loader2 } from 'lucide-react';
import { cn } from './Badge';

export default function LoadingSpinner({ className }) {
  return (
    <div className={cn("flex justify-center items-center p-8", className)}>
      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
    </div>
  );
}
