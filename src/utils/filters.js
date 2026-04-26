export function extractUniqueContributions(members) {
  if (!members) return [];
  const roles = new Set(members.map(m => m.contribution).filter(Boolean));
  return Array.from(roles).sort();
}

export function filterMembers(members, filters, projectMatcher) {
  return members.filter(member => {
    // 1. Search Query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchName = member.name?.toLowerCase().includes(query);
      const matchRole = member.contribution?.toLowerCase().includes(query);
      const matchBio = member.shortBio?.toLowerCase().includes(query);
      if (!matchName && !matchRole && !matchBio) return false;
    }

    // 2. Contribution Role
    if (filters.contribution && filters.contribution !== 'All') {
      if (member.contribution !== filters.contribution) return false;
    }

    // 3. Has Projects
    if (filters.hasProjects) {
      const hasProjects = projectMatcher(member.id);
      if (!hasProjects) return false;
    }

    // 4. Has GitHub
    if (filters.hasGithub && !member.github) {
      return false;
    }

    // 5. Has Phone
    if (filters.hasPhone && !member.phone) {
      return false;
    }

    // 6. Featured Only
    if (filters.featuredOnly && !member.featured) {
      return false;
    }

    return true;
  });
}
