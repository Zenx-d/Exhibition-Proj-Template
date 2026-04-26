import { notFound } from 'next/navigation';
import { ArrowLeft, Mail, Phone, Globe, Cpu, Zap, Activity } from 'lucide-react';
import { Github, Linkedin, Twitter } from '../../../components/BrandIcons';
import { getMemberById, getMemberMarkdownById, getAllActiveMembers } from '../../../utils/dataLoader';
import { getProjectsForMember } from '../../../utils/memberProjectMatcher';
import MarkdownRenderer from '../../../components/MarkdownRenderer';
import ProjectCard from '../../../components/ProjectCard';
import Avatar from '../../../components/Avatar';
import MemberViewTracker from '../../../components/MemberViewTracker';
import SmartLink from '../../../components/SmartLink';
import configData from '../../../data/config.json';
import { cn } from '../../../components/Badge';

export async function generateStaticParams() {
  const members = getAllActiveMembers();
  return members.map((member) => ({
    id: member.id,
  }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const member = getMemberById(id);
  if (!member) return { title: 'Not Found' };
  
  return {
    title: `${member.name} | Zen Exhibition`,
    description: member.shortBio || `Profile of ${member.name}`,
  };
}

export default async function MemberPage({ params }) {
  const { id } = await params;
  const member = getMemberById(id);
  
  if (!member) notFound();

  const markdownContent = getMemberMarkdownById(id);
  const memberProjects = getProjectsForMember(id);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: member.name,
    jobTitle: member.contribution,
    description: member.shortBio,
    image: `${configData.siteUrl}${member.avatar}`,
    url: `${configData.siteUrl}/members/${member.id}`,
    sameAs: [
      member.github,
      member.social?.linkedin,
      member.social?.twitter,
    ].filter(Boolean),
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex flex-col gap-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <MemberViewTracker memberId={member.id} memberName={member.name} />
      
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-16 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-10 md:gap-16">
          <div className="relative group">
            <div className="absolute -inset-4 bg-indigo-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <Avatar src={member.avatar} alt={member.name} size="xl" priority
              className="w-32 h-32 md:w-56 md:h-56 ring-8 ring-slate-50 dark:ring-slate-800/50 shadow-2xl shrink-0" />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <SmartLink href="/members" className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] mb-6 hover:gap-4 transition-all">
              <ArrowLeft size={14} /> Back to Team
            </SmartLink>
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white mb-4 leading-[0.9]">{member.name}</h1>
            <p className="text-xl md:text-3xl text-slate-500 dark:text-slate-400 font-bold mb-8 uppercase tracking-tight">{member.contribution}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              {member.github && (
                <a href={member.github} target="_blank" rel="noreferrer"
                  className="w-12 h-12 flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all text-slate-400 shadow-sm">
                  <Github size={24} />
                </a>
              )}
              {member.email && (
                <a href={`mailto:${member.email}`}
                  className="w-12 h-12 flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all text-slate-400 shadow-sm">
                  <Mail size={24} />
                </a>
              )}
              {member.social?.linkedin && (
                <a href={member.social.linkedin} target="_blank" rel="noreferrer"
                  className="w-12 h-12 flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all text-slate-400 shadow-sm">
                  <Linkedin size={24} />
                </a>
              )}
              {member.social?.twitter && (
                <a href={member.social.twitter} target="_blank" rel="noreferrer"
                  className="w-12 h-12 flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all text-slate-400 shadow-sm">
                  <Twitter size={24} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Biography & Technical Story */}
        <div className="lg:col-span-8 flex flex-col gap-12">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-16 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-10 border-b-4 border-indigo-500/10 pb-6 inline-block">The Story</h2>
            <div className="min-h-[300px]">
              {markdownContent ? (
                <MarkdownRenderer content={markdownContent} />
              ) : (
                <p className="text-xl text-slate-400 italic font-medium">This creator is still crafting their narrative...</p>
              )}
            </div>
          </div>

          {/* Quick Stats / Skills Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex items-center gap-6 group hover:border-indigo-500 transition-all">
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <Cpu size={32} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Architecture</p>
                <p className="text-xl font-black text-slate-900 dark:text-white uppercase">Full Stack</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex items-center gap-6 group hover:border-emerald-500 transition-all">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <Zap size={32} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Performance</p>
                <p className="text-xl font-black text-slate-900 dark:text-white uppercase">Optimized</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Sidebar Metadata */}
        <aside className="lg:col-span-4 flex flex-col gap-12">
          {/* Network Node Info */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-10 border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center gap-2">
              <Activity size={16} className="text-indigo-500" />
              Network Node
            </h3>
            
            <div className="flex flex-col gap-8">
              {member.email && (
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Direct Comms</span>
                  <a href={`mailto:${member.email}`} className="text-lg font-bold text-slate-900 dark:text-white hover:text-indigo-600 transition-colors truncate">
                    {member.email}
                  </a>
                </div>
              )}
              {member.social?.website && (
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Web Presence</span>
                  <a href={member.social.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white hover:text-indigo-600 transition-colors">
                    Live Portfolio <Globe size={16} />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Portfolio Projects */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-10 border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center gap-2">
              <Zap size={16} className="text-amber-500" />
              Portfolio
            </h3>
            <div className="flex flex-col gap-6">
              {memberProjects.length > 0 ? (
                memberProjects.map(project => (
                  <SmartLink key={project.id} href={`/projects/${project.id}`} className="group">
                    <div className="flex flex-col gap-1 p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/30 border border-transparent group-hover:border-indigo-500/50 transition-all">
                      <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Active Exhibition</span>
                      <span className="text-xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors uppercase">{project.title}</span>
                    </div>
                  </SmartLink>
                ))
              ) : (
                <p className="text-slate-500 text-sm font-bold italic">Node is currently on standby.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
