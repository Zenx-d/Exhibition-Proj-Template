'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Users, Zap, Globe, FolderKanban, Banknote } from 'lucide-react';
import configData from '../data/config.json';

export default function Home() {
  const { hero, stats } = configData;

  return (
    <div className="relative overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 dark:bg-indigo-600/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 dark:bg-purple-600/5 blur-[120px]" />
      </div>

      {/* Hero Section - Refined Pro Sizing */}
      <section className="relative z-10 min-h-[60vh] flex flex-col items-center justify-center pt-20 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white dark:bg-indigo-900/20 border border-slate-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest mb-8"
        >
          <Sparkles className="w-3 h-3" />
          <span>Annual Exhibition 2026</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter text-slate-900 dark:text-white text-center leading-[0.95] mb-10 px-4"
        >
          {hero.title.split(' ').map((word, i) => (
            <span key={i} className={word.toLowerCase() === 'zen' ? 'text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500' : ''}>
              {word}{' '}
            </span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl text-base md:text-xl text-slate-500 dark:text-slate-400 text-center leading-relaxed mb-12 px-6"
        >
          {hero.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-6"
        >
          <Link 
            href={hero.ctaLink} 
            className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 font-black text-lg text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-300"
          >
            <span>{hero.ctaText}</span>
            <Users className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          </Link>
          <Link 
            href="/projects" 
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 font-black text-lg text-slate-700 dark:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300"
          >
            <span>View Work</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>

      {/* Stats Grid - Dynamic from Config */}
      <section className="relative z-10 py-16 border-t border-slate-100 dark:border-slate-900">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-transform hover:-translate-y-2">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
              <FolderKanban size={24} />
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">{stats.totalProjects}</h3>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Total Projects</p>
          </div>
          <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-transform hover:-translate-y-2">
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6">
              <Users size={24} />
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">{stats.totalMembers}</h3>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Total Members</p>
          </div>
          <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-transform hover:-translate-y-2 sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 mb-6">
              <Banknote size={24} />
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">{stats.totalSpent}</h3>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Total Exhibition Cost</p>
          </div>
        </div>
      </section>
    </div>
  );
}
