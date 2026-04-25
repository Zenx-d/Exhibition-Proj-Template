'use client';

import SmartLink from './SmartLink';
import { ArrowRight } from 'lucide-react';
import { Github } from './BrandIcons';
import Badge from './Badge';
import Avatar from './Avatar';
import { cn } from './Badge';

export default function ProjectCard({ project, projectMembers }) {
  const { id, title, shortDescription, techStack, githubRepo, year, thumbnail } = project;

  return (
    <div className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-700 hover:-translate-y-2">
      {/* Thumbnail */}
      <SmartLink href={`/projects/${id}`} className="block relative aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500/10 to-purple-600/10" />
        )}
        <div className="absolute top-4 right-4">
          {year && <Badge className="bg-white/90 text-slate-900 backdrop-blur-lg border-none px-3 py-1 font-bold text-[10px]">{year}</Badge>}
        </div>
      </SmartLink>

      <div className="p-8 flex flex-col flex-grow">
        <div className="flex flex-wrap gap-2 mb-4">
          {techStack?.slice(0, 3).map(tech => (
            <span key={tech} className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2.5 py-1 rounded-md">
              {tech}
            </span>
          ))}
        </div>

        <SmartLink href={`/projects/${id}`} className="block">
          <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
            {title}
          </h3>
        </SmartLink>
        
        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base leading-relaxed line-clamp-2 mb-8 flex-grow font-medium">
          {shortDescription}
        </p>

        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex -space-x-2">
            {(projectMembers || []).slice(0, 3).map((member) => (
              <div key={member.id} className="relative transition-transform hover:scale-110">
                <Avatar src={member.avatar} alt={member.name} size="sm" className="ring-2 ring-white dark:ring-slate-900 w-8 h-8" />
              </div>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            {githubRepo && (
              <div className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                <Github size={20} />
              </div>
            )}
            <SmartLink href={`/projects/${id}`} className="flex items-center gap-1.5 font-black text-indigo-600 dark:text-indigo-400 text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-transform duration-500">
              Details <ArrowRight size={14} />
            </SmartLink>
          </div>
        </div>
      </div>
    </div>
  );
}
