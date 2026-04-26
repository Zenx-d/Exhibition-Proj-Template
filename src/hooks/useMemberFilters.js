import { useState, useMemo } from 'react';
import { filterMembers, extractUniqueContributions } from '../utils/filters';
import { useDebounce } from './useDebounce';

export function useMemberFilters(initialMembers, projectMatcher) {
  const [searchQuery, setSearchQuery] = useState('');
  const [contribution, setContribution] = useState('All');
  const [hasProjects, setHasProjects] = useState(false);
  const [hasGithub, setHasGithub] = useState(false);
  const [hasPhone, setHasPhone] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const filters = {
    searchQuery: debouncedSearchQuery,
    contribution,
    hasProjects,
    hasGithub,
    hasPhone,
    featuredOnly
  };

  const filteredMembers = useMemo(() => {
    return filterMembers(initialMembers, filters, projectMatcher);
  }, [initialMembers, debouncedSearchQuery, contribution, hasProjects, hasGithub, hasPhone, featuredOnly, projectMatcher]);

  const uniqueContributions = useMemo(() => {
    return extractUniqueContributions(initialMembers);
  }, [initialMembers]);

  return {
    filters: {
      searchQuery,
      contribution,
      hasProjects,
      hasGithub,
      hasPhone,
      featuredOnly
    },
    setters: {
      setSearchQuery,
      setContribution,
      setHasProjects,
      setHasGithub,
      setHasPhone,
      setFeaturedOnly
    },
    filteredMembers,
    uniqueContributions
  };
}
