import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Calendar } from 'lucide-react';
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
    <div className="flex flex-col gap-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <ProjectViewTracker projectId={project.id} projectTitle={project.title} />
      
      {/* Normalized Header Section */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm relative">
        <div className="relative aspect-video md:aspect-[21/7] w-full">
          {project.thumbnail ? (
            <Image 
              src={project.thumbnail} 
              alt={project.title} 
              fill
              priority
              sizes="100vw"
              className="object-cover" 
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-700" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8">
            <SmartLink href="/projects" className="inline-flex items-center gap-1 text-indigo-400 font-bold uppercase tracking-widest text-[9px] md:text-[10px] mb-3 md:mb-4">
              <ArrowLeft size={12} /> Back to Projects
            </SmartLink>
            <h1 className="text-3xl md:text-6xl font-black tracking-tighter text-white mb-4 leading-tight">{project.title}</h1>
            <div className="flex flex-wrap items-center gap-3 md:gap-4">
              {project.year && (
                <div className="flex items-center gap-1 text-white/90 font-bold text-xs md:text-sm bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-md">
                  <Calendar size={14} /> {project.year}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {project.techStack?.map(tech => (
                  <Badge key={tech} className="bg-indigo-600/30 text-white border-none text-[10px] md:text-xs px-2.5 py-1">{tech}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-12 border-t border-slate-100 dark:border-slate-800">
          <p className="text-lg md:text-2xl font-bold text-slate-800 dark:text-slate-200 leading-tight mb-8">
            {project.shortDescription}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            {project.githubRepo && (
              <a href={project.githubRepo} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:scale-105 transition-transform">
                <Github size={18} /> View Source
              </a>
            )}
            {project.demoUrl && (
              <a href={project.demoUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:scale-105 shadow-lg shadow-indigo-500/20 transition-all">
                <ExternalLink size={18} /> Live Demo
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        <div className="lg:col-span-8 order-2 lg:order-1">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter mb-8 border-b-2 border-slate-100 dark:border-slate-800 pb-4 inline-block">The Blueprint</h2>
            <div className="min-h-[200px]">
              {markdownContent ? (
                <MarkdownRenderer content={markdownContent} />
              ) : (
                <p className="text-lg text-slate-400 italic">Technical documentation is being finalized...</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 order-1 lg:order-2">
          <div className="lg:sticky lg:top-28 flex flex-col gap-8">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-xl md:text-2xl font-black tracking-tighter mb-6 border-b-2 border-slate-100 dark:border-slate-800 pb-2 inline-block">The Team</h2>
              <div className="flex flex-col gap-4">
                {teamMembers.map(member => (
                  <SmartLink key={member.id} href={`/members/${member.id}`} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-indigo-500 transition-all group">
                    <Avatar src={member.avatar} alt={member.name} size="md" className="w-10 h-10 md:w-12 md:h-12" />
                    <div className="min-w-0">
                      <h4 className="text-base md:text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight truncate">{member.name}</h4>
                      <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider truncate">{member.contribution}</p>
                    </div>
                  </SmartLink>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
