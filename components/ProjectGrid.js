'use client';

import { motion } from 'framer-motion';
import ProjectCard from './ProjectCard';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 25, mass: 1.2 } }
};

export default function ProjectGrid({ projects, projectMembersMap }) {
  if (!projects || projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl">🚀</span>
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No projects found</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md">
          There are no projects available to display at this time.
        </p>
      </div>
    );
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8"
    >
      {projects.map((project) => (
        <motion.div key={project.id} variants={item} layout>
          <ProjectCard 
            project={project} 
            projectMembers={projectMembersMap ? projectMembersMap[project.id] : []}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
