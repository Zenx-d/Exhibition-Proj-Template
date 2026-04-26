'use client';

import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import MemberGrid from './MemberGrid';
import { useMemberFilters } from '../hooks/useMemberFilters';
import configData from '../data/config.json';
import { cn } from './Badge';
import { useEffect, useRef } from 'react';
import { captureEvent, captureSearch } from '../utils/telemetryClient';

export default function MembersClient({ initialMembers, projectCountMap }) {
  const projectMatcher = (memberId) => projectCountMap[memberId] > 0;
  const { filters, setters, filteredMembers, uniqueContributions } = useMemberFilters(initialMembers, projectMatcher);
  const searchTimeoutRef = useRef(null);

  // Track Filters and Search
  useEffect(() => {
    // 1. Filter Tracking
    captureEvent('filter_used', { 
      filters: { 
        contribution: filters.contribution, 
        hasProjects: filters.hasProjects 
      }, 
      resultCount: filteredMembers.length 
    });
  }, [filters.contribution, filters.hasProjects, filteredMembers.length]);

  useEffect(() => {
    // 2. Search Tracking (Debounced)
    if (filters.search) {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => {
        captureSearch(filters.search, filteredMembers.length);
      }, 1500); // Wait for 1.5s of typing before tracking
    }
  }, [filters.search, filteredMembers.length]);

  return (
    <div className="flex flex-col gap-12">
      {/* Normalized Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-12">
        <div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white mb-4 leading-none">
            The Team.
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            Meet the innovative individuals pushing the boundaries of technology and design.
          </p>
        </div>
        <div className="text-4xl md:text-5xl font-black text-slate-200 dark:text-slate-800 select-none">
          {filteredMembers.length.toString().padStart(2, '0')}
        </div>
      </section>

      {/* Normalized Horizontal Filter Bar - STICKY */}
      <div className="sticky top-24 z-40 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 py-5 -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-12 md:px-12">
        <div className="flex flex-col lg:flex-row items-center gap-6">
          {/* Search Input */}
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search talent..."
              value={filters.search}
              onChange={(e) => setters.setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 transition-all font-bold text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>

          {/* Role Chips */}
          <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button 
              onClick={() => setters.setContribution('')}
              className={cn(
                "px-4 py-2 rounded-lg text-[10px] font-black transition-all whitespace-nowrap uppercase tracking-widest",
                filters.contribution === '' 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" 
                  : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              All
            </button>
            {uniqueContributions.map(role => (
              <button 
                key={role}
                onClick={() => setters.setContribution(role)}
                className={cn(
                  "px-4 py-2 rounded-lg text-[10px] font-black transition-all whitespace-nowrap uppercase tracking-widest",
                  filters.contribution === role 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" 
                    : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                {role}
              </button>
            ))}
          </div>

          {/* Toggle Projects Only */}
          <label className="flex items-center gap-2 cursor-pointer group shrink-0">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={filters.hasProjects}
                onChange={(e) => setters.setHasProjects(e.target.checked)}
              />
              <div className={cn(
                "w-10 h-5 rounded-full transition-colors",
                filters.hasProjects ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
              )} />
              <div className={cn(
                "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform",
                filters.hasProjects ? "translate-x-5" : "translate-x-0"
              )} />
            </div>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active Only</span>
          </label>
        </div>
      </div>

      {/* Grid Area */}
      <MemberGrid 
        members={filteredMembers} 
        projectCountMap={projectCountMap}
        showProjectCount={configData.features.showProjectCountOnMemberCards}
      />
    </div>
  );
}
