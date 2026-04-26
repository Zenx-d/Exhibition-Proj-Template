import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const CONTENT_DIR = path.join(process.cwd(), 'src', 'content');
const PROJECTS_DIR = path.join(CONTENT_DIR, 'projects');
const MEMBERS_DIR = path.join(DATA_DIR, 'members');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const MEMBERS_FILE = path.join(DATA_DIR, 'members.json');

/**
 * Sanitize IDs to prevent path traversal attacks.
 * Only allows alphanumeric characters, hyphens, and underscores.
 */
function sanitizeId(id) {
  if (!id || typeof id !== 'string') return null;
  const safe = id.replace(/[^a-zA-Z0-9_-]/g, '');
  // Must be at least 1 char and not too long
  if (safe.length < 1 || safe.length > 128) return null;
  return safe;
}

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
  const safeId = sanitizeId(id);
  if (!safeId) return null;
  const projects = getAllProjects();
  return projects.find(p => p.id === safeId) || null;
}

export function getProjectMarkdownById(id) {
  const safeId = sanitizeId(id);
  if (!safeId) return '';
  try {
    const mdPath = path.join(PROJECTS_DIR, `${safeId}.md`);
    if (!fs.existsSync(mdPath)) return '';
    return fs.readFileSync(mdPath, 'utf8');
  } catch (error) {
    console.error(`Error reading project MD for ${safeId}:`, error);
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
  const safeId = sanitizeId(id);
  if (!safeId) return null;
  const jsonPath = path.join(MEMBERS_DIR, safeId, `${safeId}.json`);
  return safeReadJson(jsonPath);
}

export function getMemberMarkdownById(id) {
  const safeId = sanitizeId(id);
  if (!safeId) return '';
  try {
    const mdPath = path.join(MEMBERS_DIR, safeId, `${safeId}.md`);
    if (!fs.existsSync(mdPath)) return '';
    return fs.readFileSync(mdPath, 'utf8');
  } catch (error) {
    console.error(`Error reading member MD for ${safeId}:`, error);
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
