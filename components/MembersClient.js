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
    <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex flex-col gap-12">
      {/* Normalized Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-8 md:pb-12">
        <div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white mb-3 leading-none">
            The Team.
          </h1>
          <p className="text-base text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            Meet the innovative individuals pushing the boundaries of technology and design.
          </p>
        </div>
        <div className="text-4xl md:text-5xl font-black text-slate-200 dark:text-slate-800 select-none">
          {filteredMembers.length.toString().padStart(2, '0')}
        </div>
      </section>

      {/* Sticky Filter Bar */}
      <div className="sticky top-24 z-40 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 py-4">
        <div className="flex flex-col gap-3">
          {/* Top row: Search + Toggle */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search talent..."
                value={filters.search}
                onChange={(e) => setters.setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 transition-all font-bold text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>
            {/* Active Only Toggle */}
            <label className="flex items-center gap-2 cursor-pointer group shrink-0">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={filters.hasProjects}
                  onChange={(e) => setters.setHasProjects(e.target.checked)}
                />
                <div className={cn(
                  "w-9 h-5 rounded-full transition-colors",
                  filters.hasProjects ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                )} />
                <div className={cn(
                  "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform",
                  filters.hasProjects ? "translate-x-4" : "translate-x-0"
                )} />
              </div>
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden sm:inline">Active</span>
            </label>
          </div>
          {/* Bottom row: Role Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
            <button
              onClick={() => setters.setContribution('')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-black transition-all whitespace-nowrap uppercase tracking-widest shrink-0",
                filters.contribution === ''
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
              )}
            >
              All
            </button>
            {uniqueContributions.map(role => (
              <button
                key={role}
                onClick={() => setters.setContribution(role)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-black transition-all whitespace-nowrap uppercase tracking-widest shrink-0",
                  filters.contribution === role
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
                )}
              >
                {role}
              </button>
            ))}
          </div>
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
