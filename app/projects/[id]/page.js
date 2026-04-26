import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Calendar, Users, Cpu, Zap, Activity } from 'lucide-react';
import { Github } from '../../../components/BrandIcons';
import { getAllProjects, getProjectMarkdownById, getProjectById } from '../../../utils/dataLoader';
import { getMembersForProject } from '../../../utils/memberProjectMatcher';
import MarkdownRenderer from '../../../components/MarkdownRenderer';
import Avatar from '../../../components/Avatar';
import Badge from '../../../components/Badge';
import ProjectViewTracker from '../../../components/ProjectViewTracker';
import SmartLink from '../../../components/SmartLink';
import configData from '../../../data/config.json';

export async function generateStaticParams() {
  const projects = getAllProjects();
  return projects.map((project) => ({
    id: project.id,
  }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const project = getProjectById(id);
  if (!project) return { title: 'Project Not Found' };
  
  return {
    title: `${project.title} | Zen Exhibition`,
    description: project.shortDescription,
  };
}

export default async function ProjectPage({ params }) {
  const { id } = await params;
  const project = getProjectById(id);
  
  if (!project) notFound();

  const markdownContent = getProjectMarkdownById(id);
  const teamMembers = getMembersForProject(id);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.shortDescription,
    image: `${configData.siteUrl}${project.thumbnail}`,
    url: `${configData.siteUrl}/projects/${project.id}`,
    author: teamMembers.map(m => ({
      '@type': 'Person',
      name: m.name,
      url: `${configData.siteUrl}/members/${m.id}`,
    })),
    keywords: project.techStack?.join(', '),
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex flex-col gap-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <ProjectViewTracker projectId={project.id} projectTitle={project.title} />
      
      {/* Normalized Header Section */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm relative group">
        <div className="relative aspect-video md:aspect-[21/8] w-full overflow-hidden">
          {project.thumbnail ? (
            <Image 
              src={project.thumbnail} 
              alt={project.title} 
              fill
              priority
              sizes="100vw"
              className="object-cover group-hover:scale-105 transition-transform duration-1000" 
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
          
          <div className="absolute bottom-8 left-8 right-8 md:bottom-16 md:left-16 md:right-16">
            <SmartLink href="/projects" className="inline-flex items-center gap-2 text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] mb-6 hover:gap-4 transition-all">
              <ArrowLeft size={14} /> Back to Projects
            </SmartLink>
            <h1 className="text-4xl md:text-8xl font-black tracking-tighter text-white mb-6 leading-[0.85] uppercase">{project.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4">
              {project.year && (
                <div className="flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-widest bg-white/10 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10">
                  <Calendar size={14} className="text-indigo-400" /> {project.year}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {project.techStack?.map(tech => (
                  <div key={tech} className="bg-indigo-600/40 text-white font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl backdrop-blur-xl border border-white/10">
                    {tech}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-16 border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-transparent backdrop-blur-sm">
          <p className="text-xl md:text-3xl font-bold text-slate-800 dark:text-slate-200 leading-tight mb-10 max-w-4xl">
            {project.shortDescription}
          </p>
          <div className="flex flex-wrap gap-4">
            {project.demoUrl && (
              <a href={project.demoUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-500/20 transition-all">
                <ExternalLink size={18} /> Launch Exhibition
              </a>
            )}
            {project.githubRepo && (
              <a href={project.githubRepo} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all">
                <Github size={18} /> Source Blueprint
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Technical Documentation */}
        <div className="lg:col-span-8 flex flex-col gap-12">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-16 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-10 border-b-4 border-indigo-500/10 pb-6 inline-block">The Blueprint</h2>
            <div className="min-h-[300px]">
              {markdownContent ? (
                <MarkdownRenderer content={markdownContent} />
              ) : (
                <p className="text-xl text-slate-400 italic font-medium">Technical documentation is being synchronized...</p>
              )}
            </div>
          </div>
          
          {/* Hardware / Stack Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex items-center gap-6 group hover:border-indigo-500 transition-all">
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <Cpu size={32} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Architecture</p>
                <p className="text-xl font-black text-slate-900 dark:text-white uppercase">Optimized</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex items-center gap-6 group hover:border-emerald-500 transition-all">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <Zap size={32} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Status</p>
                <p className="text-xl font-black text-slate-900 dark:text-white uppercase">Production</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Guild Members */}
        <aside className="lg:col-span-4 flex flex-col gap-12">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-10 border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center gap-2">
              <Users size={16} className="text-indigo-500" />
              The Guild
            </h3>
            <div className="flex flex-col gap-6">
              {teamMembers.map(member => (
                <SmartLink key={member.id} href={`/members/${member.id}`} className="flex items-center gap-5 p-5 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-transparent hover:border-indigo-500 transition-all group">
                  <Avatar src={member.avatar} alt={member.name} size="md" className="w-14 h-14 group-hover:scale-110 transition-transform" />
                  <div className="min-w-0">
                    <h4 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors uppercase leading-tight truncate">{member.name}</h4>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest truncate">{member.contribution}</p>
                  </div>
                </SmartLink>
              ))}
            </div>
          </div>

          {/* Node Health */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-8 border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center gap-2">
              <Activity size={16} className="text-emerald-500" />
              Node Health
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Security</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Verified</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Performance</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">99th Pctl</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
