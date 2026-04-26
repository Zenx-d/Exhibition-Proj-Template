const fs = require('fs');
const path = require('path');

const MEMBERS_DIR = path.join(__dirname, '../src/data/members');

// Ensure base directory exists
if (!fs.existsSync(MEMBERS_DIR)) {
  fs.mkdirSync(MEMBERS_DIR, { recursive: true });
}

const TOTAL_MEMBERS = 50;

console.log(`Generating ${TOTAL_MEMBERS} member placeholders...`);

for (let i = 1; i <= TOTAL_MEMBERS; i++) {
  // Format ID with leading zero (e.g., zen-01)
  const idNum = i.toString().padStart(2, '0');
  const memberId = `zen-${idNum}`;
  const memberDir = path.join(MEMBERS_DIR, memberId);

  // Create member directory
  if (!fs.existsSync(memberDir)) {
    fs.mkdirSync(memberDir);
  }

  // Create JSON file
  const jsonPath = path.join(memberDir, `${memberId}.json`);
  const jsonData = {
    id: memberId,
    state: "hidden", // Default to hidden as requested
    name: `Member ${idNum}`,
    contribution: "Exhibition Member",
    shortBio: "This is a placeholder biography for the member. Edit this file to add details.",
    avatar: "",
    featured: false,
    order: i,
    github: "",
    phone: "",
    email: "",
    social: {
      linkedin: "",
      twitter: "",
      website: ""
    }
  };

  fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));

  // Create Markdown file
  const mdPath = path.join(memberDir, `${memberId}.md`);
  const mdContent = `# Hello, I'm Member ${idNum}

Welcome to my exhibition page! You can add **Markdown**, embedded HTML, iframes, games, videos, or anything else here.

## My Work
Replace this content with your actual portfolio, interactive experiments, or project details.
`;

  fs.writeFileSync(mdPath, mdContent);
}

console.log('✅ Successfully generated member placeholders.');
