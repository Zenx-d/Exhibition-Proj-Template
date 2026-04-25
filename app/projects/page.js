import { getAllProjects } from '../../utils/dataLoader';
import { getMembersForProject } from '../../utils/memberProjectMatcher';
import ProjectGrid from '../../components/ProjectGrid';

export const metadata = {
  title: 'Projects | Zen Exhibition',
  description: 'Explore the amazing projects built by our members.',
};

export default function ProjectsPage() {
  const projects = getAllProjects();
  
  const projectMembersMap = {};
  projects.forEach(project => {
    projectMembersMap[project.id] = getMembersForProject(project.id);
  });

  return (
    <div className="flex flex-col gap-12">
      {/* Normalized Header */}
      <section className="border-b border-slate-200 dark:border-slate-800 pb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-indigo-900/20 border border-slate-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest mb-6 shadow-sm">
          Curated Showcase
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white mb-6 leading-none">
          The Lab.
        </h1>
        <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
          Where technical precision meets creative freedom. Explore the experiments defining our annual exhibition.
        </p>
      </section>

      <ProjectGrid projects={projects} projectMembersMap={projectMembersMap} />
    </div>
  );
}
