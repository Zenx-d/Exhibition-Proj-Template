import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -z-20 animate-pulse" />
      
      <div className="text-[12rem] md:text-[25rem] font-black text-slate-100/50 dark:text-slate-900 absolute -z-10 select-none leading-none tracking-tighter mix-blend-difference">
        404
      </div>

      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
          LOST IN <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">THE VOID</span>
        </h1>
        <div className="h-2 w-32 bg-indigo-600 mx-auto rounded-full" />
      </div>

      <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 max-w-xl mb-12 font-bold leading-relaxed">
        The exhibition at these coordinates has been archived or never existed.
      </p>

      <Link 
        href="/"
        className="group relative inline-flex items-center gap-3 px-12 py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xl rounded-[2rem] hover:scale-105 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500"
      >
        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-2 transition-transform" />
        Return to Home
      </Link>
    </div>
  );
}
