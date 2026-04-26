import { notFound } from 'next/navigation';
import { ArrowLeft, Mail, Phone, Globe } from 'lucide-react';
import { Github, Linkedin, Twitter } from '../../../components/BrandIcons';
import { getMemberById, getMemberMarkdownById, getAllActiveMembers } from '../../../utils/dataLoader';
import { getProjectsForMember } from '../../../utils/memberProjectMatcher';
import MarkdownRenderer from '../../../components/MarkdownRenderer';
import ProjectCard from '../../../components/ProjectCard';
import Avatar from '../../../components/Avatar';
import MemberViewTracker from '../../../components/MemberViewTracker';
import SmartLink from '../../../components/SmartLink';
import configData from '../../../data/config.json';

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
    <div className="flex flex-col gap-8 md:gap-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MemberViewTracker memberId={member.id} memberName={member.name} />
      
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 md:gap-10">
          <Avatar src={member.avatar} alt={member.name} size="xl"
            className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 ring-4 md:ring-8 ring-slate-50 dark:ring-slate-800/50 shadow-2xl shrink-0" />
          
          <div className="flex-1 text-center sm:text-left">
            <SmartLink href="/members" className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest text-[9px] md:text-[10px] mb-3">
              <ArrowLeft size={12} /> Back to Team
            </SmartLink>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white mb-1.5 md:mb-2 leading-tight">{member.name}</h1>
            <p className="text-base md:text-2xl text-slate-500 dark:text-slate-400 font-bold mb-5">{member.contribution}</p>
            
            <div className="flex flex-wrap justify-center sm:justify-start gap-2.5">
              {member.github && (
                <a href={member.github} target="_blank" rel="noreferrer"
                  className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white rounded-xl transition-all text-slate-400">
                  <Github size={20} />
                </a>
              )}
              {member.email && (
                <a href={`mailto:${member.email}`}
                  className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white rounded-xl transition-all text-slate-400">
                  <Mail size={20} />
                </a>
              )}
              {member.social?.linkedin && (
                <a href={member.social.linkedin} target="_blank" rel="noreferrer"
                  className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white rounded-xl transition-all text-slate-400">
                  <Linkedin size={20} />
                </a>
              )}
              {member.social?.twitter && (
                <a href={member.social.twitter} target="_blank" rel="noreferrer"
                  className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white rounded-xl transition-all text-slate-400">
                  <Twitter size={20} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        <div className="lg:col-span-8 order-2 lg:order-1">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter mb-6 md:mb-8 border-b-2 border-slate-100 dark:border-slate-800 pb-4 inline-block">The Story</h2>
            <div className="min-h-[200px]">
              {markdownContent ? (
                <MarkdownRenderer content={markdownContent} />
              ) : (
                <p className="text-base text-slate-400 italic">This creator is still crafting their narrative...</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 order-1 lg:order-2">
          <div className="lg:sticky lg:top-28 flex flex-col gap-8">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-xl md:text-2xl font-black tracking-tighter mb-5 border-b-2 border-slate-100 dark:border-slate-800 pb-2 inline-block">Portfolio</h2>
              <div className="flex flex-col gap-6">
                {memberProjects.length > 0 ? (
                  memberProjects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))
                ) : (
                  <p className="text-slate-500 text-sm">No projects linked yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
