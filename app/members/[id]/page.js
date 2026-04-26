import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, Mail, Phone, Globe, Cpu, Zap, Activity } from 'lucide-react';
import { Github, Linkedin, Twitter } from '../../../components/BrandIcons';
import { getMemberById, getMemberMarkdownById, getProjectsByMemberId, getAllActiveMembers } from '../../../utils/dataLoader';
import MarkdownRenderer from '../../../components/MarkdownRenderer';
import MemberViewTracker from '../../../components/MemberViewTracker';
import SmartLink from '../../../components/SmartLink';
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
  if (!member) return { title: 'Member Not Found' };
  return {
    title: `${member.name} | Zen Exhibition`,
    description: member.shortBio,
  };
}

export default async function MemberPage({ params }) {
  const { id } = await params;
  const member = getMemberById(id);

  if (!member || member.state !== 'active') {
    notFound();
  }

  const markdownContent = getMemberMarkdownById(id);
  const projects = getProjectsByMemberId(id);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: member.name,
    jobTitle: member.contribution,
    description: member.shortBio,
    image: member.avatar,
    sameAs: [
      member.github,
      member.social?.linkedin,
      member.social?.twitter,
      member.social?.website,
    ].filter(Boolean),
  };

  return (
    <div className="min-h-screen bg-grid">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <MemberViewTracker memberId={member.id} memberName={member.name} />

      {/* Hero Header */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden bg-slate-900">
         <div className="absolute inset-0 opacity-40 bg-gradient-to-b from-transparent to-slate-950 z-10" />
         {member.avatar ? (
           <Image 
             src={member.avatar} 
             alt={member.name}
             fill
             className="object-cover scale-105 blur-sm"
             priority
           />
         ) : (
           <div className="w-full h-full bg-indigo-900/20" />
         )}
         
         <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center">
            <SmartLink 
              href="/members" 
              className="absolute top-10 left-6 md:left-12 flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
            >
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 group-hover:scale-110 transition-transform">
                <ArrowLeft size={18} />
              </div>
              <span className="hidden md:block font-black uppercase tracking-widest text-[10px]">Back to Guild</span>
            </SmartLink>

            <div className="relative group">
               <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-1000" />
               <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full border-[6px] border-white/10 overflow-hidden shadow-2xl">
                 {member.avatar ? (
                   <Image src={member.avatar} alt={member.name} fill className="object-cover" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center bg-slate-800 text-6xl font-black text-white">
                     {member.name.charAt(0)}
                   </div>
                 )}
               </div>
            </div>

            <h1 className="mt-8 text-5xl md:text-8xl font-black text-white tracking-tighter uppercase leading-[0.85]">
              {member.name}
            </h1>
            <p className="mt-4 text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] md:text-xs">
              {member.contribution}
            </p>
         </div>
      </div>

      <div className="container mx-auto px-6 -mt-16 relative z-30 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          
          {/* Left: Content */}
          <div className="lg:col-span-8 space-y-12">
            <div className="ultra-glass rounded-[3rem] p-8 md:p-16 border border-white/10 shadow-2xl">
              <MarkdownRenderer content={markdownContent} />
            </div>

            {/* Hardware/Skills Badges */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3 bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 px-6 py-4 rounded-3xl group transition-all hover:scale-105">
                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                   <Cpu size={20} />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Architecture</div>
                  <div className="font-black text-sm uppercase">Full Stack</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 px-6 py-4 rounded-3xl group transition-all hover:scale-105">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                   <Zap size={20} />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Performance</div>
                  <div className="font-black text-sm uppercase">Optimized</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Social & Contact */}
            <div className="ultra-glass rounded-[3rem] p-10 border border-white/10">
              <h3 className="font-black text-xs uppercase tracking-[0.3em] text-slate-500 mb-8 border-b border-slate-200 dark:border-white/5 pb-4 flex items-center gap-2">
                <Activity size={14} className="text-indigo-500" />
                Network Node
              </h3>
              
              <div className="space-y-6">
                {member.email && (
                  <a href={`mailto:${member.email}`} className="flex items-center gap-5 group">
                    <div className="p-4 rounded-2xl bg-slate-100 dark:bg-white/5 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <Mail size={18} />
                    </div>
                    <span className="text-sm font-bold truncate group-hover:text-indigo-500 transition-colors">{member.email}</span>
                  </a>
                )}
                {member.phone && (
                  <div className="flex items-center gap-5 group">
                    <div className="p-4 rounded-2xl bg-slate-100 dark:bg-white/5 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <Phone size={18} />
                    </div>
                    <span className="text-sm font-bold group-hover:text-indigo-500 transition-colors">{member.phone}</span>
                  </div>
                )}
                {member.social?.website && (
                  <a href={member.social.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-5 group">
                    <div className="p-4 rounded-2xl bg-slate-100 dark:bg-white/5 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <Globe size={18} />
                    </div>
                    <span className="text-sm font-bold group-hover:text-indigo-500 transition-colors truncate">Live Website</span>
                  </a>
                )}
              </div>

              <div className="flex gap-4 mt-12 pt-8 border-t border-slate-100 dark:border-white/5">
                {member.github && (
                  <a href={member.github} target="_blank" rel="noopener noreferrer" className="p-4 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-indigo-600 hover:text-white transition-all">
                    <Github className="w-6 h-6" />
                  </a>
                )}
                {member.social?.twitter && (
                  <a href={member.social.twitter} target="_blank" rel="noopener noreferrer" className="p-4 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-indigo-600 hover:text-white transition-all">
                    <Twitter className="w-6 h-6" />
                  </a>
                )}
                {member.social?.linkedin && (
                  <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer" className="p-4 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-indigo-600 hover:text-white transition-all">
                    <Linkedin className="w-6 h-6" />
                  </a>
                )}
              </div>
            </div>

            {/* Projects Sidebar List */}
            <div className="ultra-glass rounded-[3rem] p-10 border border-white/10">
              <h3 className="font-black text-xs uppercase tracking-[0.3em] text-slate-500 mb-8 border-b border-slate-200 dark:border-white/5 pb-4 flex items-center gap-2">
                < Zap size={14} className="text-emerald-500" />
                Exhibitions
              </h3>
              <div className="space-y-4">
                {projects.length > 0 ? (
                  projects.map(project => (
                    <SmartLink key={project.id} href={`/projects/${project.id}`} className="block group">
                      <div className="p-6 rounded-3xl bg-slate-100 dark:bg-white/5 border border-transparent group-hover:border-indigo-500/30 transition-all">
                        <div className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-1">Project</div>
                        <div className="font-black text-lg group-hover:text-indigo-500 transition-colors uppercase leading-none">{project.title}</div>
                      </div>
                    </SmartLink>
                  ))
                ) : (
                  <p className="text-slate-500 text-xs font-black uppercase tracking-widest pl-2">Standby for projects</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
