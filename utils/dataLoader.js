import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const CONTENT_DIR = path.join(process.cwd(), 'content');
const PROJECTS_DIR = path.join(CONTENT_DIR, 'projects');
const MEMBERS_DIR = path.join(DATA_DIR, 'members');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const MEMBERS_FILE = path.join(DATA_DIR, 'members.json');

// Helper for safe JSON reading
function safeReadJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading JSON from ${filePath}:`, error);
    return null;
  }
}

// PROJECTS
export function getAllProjects() {
  const data = safeReadJson(PROJECTS_FILE);
  return data?.projects || [];
}

export function getProjectById(id) {
  const projects = getAllProjects();
  return projects.find(p => p.id === id) || null;
}

export function getProjectMarkdownById(id) {
  try {
    const mdPath = path.join(PROJECTS_DIR, `${id}.md`);
    if (!fs.existsSync(mdPath)) return '';
    return fs.readFileSync(mdPath, 'utf8');
  } catch (error) {
    console.error(`Error reading project MD for ${id}:`, error);
    return '';
  }
}

// MEMBERS
export function getAllActiveMemberIds() {
  const data = safeReadJson(MEMBERS_FILE);
  if (!data || !data.members) return [];
  return data.members
    .filter(m => m.state === 'active')
    .map(m => m.id);
}

export function getMemberById(id) {
  const jsonPath = path.join(MEMBERS_DIR, id, `${id}.json`);
  return safeReadJson(jsonPath);
}

export function getMemberMarkdownById(id) {
  try {
    const mdPath = path.join(MEMBERS_DIR, id, `${id}.md`);
    if (!fs.existsSync(mdPath)) return '';
    return fs.readFileSync(mdPath, 'utf8');
  } catch (error) {
    console.error(`Error reading member MD for ${id}:`, error);
    return '';
  }
}

export function getAllActiveMembers() {
  const ids = getAllActiveMemberIds();
  return ids
    .map(id => getMemberById(id))
    .filter(member => member !== null)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

export function getProjectsByMemberId(memberId) {
  const projects = getAllProjects();
  return projects.filter(project => 
    project.members && project.members.includes(memberId)
  );
}
