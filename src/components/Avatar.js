'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from './Badge';

export default function Avatar({ src, alt, fallback, size = 'md', className, priority = false }) {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-xl'
  };

  const initials = fallback || alt?.substring(0, 2).toUpperCase() || '??';

  return (
    <div className={cn(
      "relative inline-flex items-center justify-center overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700 shrink-0 ring-2 ring-white dark:ring-slate-900",
      sizeClasses[size],
      className
    )}>
      {src && !hasError ? (
        <Image 
          src={src} 
          alt={alt || 'Avatar'} 
          fill
          priority={priority}
          sizes="(max-width: 768px) 10vw, 5vw"
          className="object-cover" 
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="font-bold text-slate-500 dark:text-slate-400">
          {initials}
        </span>
      )}
    </div>
  );
}
