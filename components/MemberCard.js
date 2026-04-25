import Link from 'next/link';
import { Mail, Globe, ArrowRight } from 'lucide-react';
import { Github, Linkedin } from './BrandIcons';
import Avatar from './Avatar';
import { cn } from './Badge';

export default function MemberCard({ member, showProjectCount, projectCount }) {
  const { id, name, contribution, shortBio, avatar, github, email, social } = member;

  return (
    <Link 
      href={`/members/${id}`}
      className={cn(
        "group relative flex flex-col bg-white dark:bg-slate-900 rounded-3xl p-8 transition-all duration-500",
        "border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-2"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-5 mb-6">
        <Avatar src={avatar} alt={name} size="xl" className="w-16 h-16 ring-4 ring-slate-50 dark:ring-slate-800/50 group-hover:ring-indigo-50 dark:group-hover:ring-indigo-900/20 transition-all duration-500 shadow-lg" />
        <div className="flex flex-col min-w-0">
          <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight truncate">
            {name}
          </h3>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
            {contribution}
          </span>
        </div>
      </div>

      {/* Bio */}
      <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base leading-relaxed line-clamp-3 mb-8 flex-grow font-medium">
        {shortBio || "No biography provided yet."}
      </p>

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {github && (
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-indigo-600 hover:text-white transition-all">
              <Github size={18} />
            </div>
          )}
          {email && (
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-indigo-600 hover:text-white transition-all">
              <Mail size={18} />
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1.5 font-black text-indigo-600 dark:text-indigo-400 text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-transform duration-500">
          Profile <ArrowRight size={14} />
        </div>
      </div>
    </Link>
  );
}
