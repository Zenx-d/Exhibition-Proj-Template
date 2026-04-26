'use client';

import { motion } from 'framer-motion';
import MemberCard from './MemberCard';

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

export default function MemberGrid({ members, projectCountMap, showProjectCount }) {
  if (!members || members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl">📭</span>
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No members found</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md">
          We couldn't find any members matching your current filters. Try adjusting your search or clearing the filters.
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
      {members.map((member) => (
        <motion.div key={member.id} variants={item} layout>
          <MemberCard 
            member={member} 
            showProjectCount={showProjectCount}
            projectCount={projectCountMap?.[member.id] || 0}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
