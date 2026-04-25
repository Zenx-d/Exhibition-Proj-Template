import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="text-[15rem] md:text-[20rem] font-black text-slate-100 dark:text-slate-900 absolute -z-10 select-none leading-none">
        404
      </div>
      <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white mb-6 leading-none">
        Lost in Space.
      </h1>
      <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 max-w-2xl mb-12 font-medium">
        The coordinates you've entered lead to a void. Let's get you back to the center of the exhibition.
      </p>
      <Link 
        href="/"
        className="group relative inline-flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white font-black text-xl rounded-3xl hover:bg-indigo-700 hover:shadow-[0_20px_50px_rgba(79,70,229,0.3)] transition-all duration-500"
      >
        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-2 transition-transform" />
        Back to Exhibition
      </Link>
    </div>
  );
}
