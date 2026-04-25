import { getProjectsByMemberId, getAllProjects, getMemberById } from './dataLoader';

export function getProjectsForMember(memberId) {
  // Returns project objects for a specific member
  return getProjectsByMemberId(memberId);
}

export function getMembersForProject(projectId) {
  // Returns member objects for a specific project
  const projects = getAllProjects();
  const project = projects.find(p => p.id === projectId);
  if (!project || !project.members) return [];
  
  return project.members
    .map(memberId => getMemberById(memberId))
    .filter(Boolean); // Filter out nulls if member doesn't exist or is invalid
}

export function hasProjects(memberId) {
  const projects = getProjectsForMember(memberId);
  return projects.length > 0;
}
