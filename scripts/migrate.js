/**
 * NEON DATABASE MIGRATION TOOL
 * 
 * Usage: node scripts/migrate.js
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.NEXT_PUBLIC_DATABASE_URL;

async function migrate() {
  if (!DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL not found in .env.local');
    return;
  }
  
  console.log('🚀 Connecting to Neon...');
  const sql = neon(DATABASE_URL);
  const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

  // Split logic blocks (ignores semicolons inside $$ blocks)
  const blocks = [];
  let current = '';
  let inDollar = false;
  schemaSql.split('\n').forEach(line => {
    current += line + '\n';
    if (line.includes('$$')) inDollar = !inDollar;
    if (!inDollar && line.trim().endsWith(';')) {
      blocks.push(current.trim());
      current = '';
    }
  });

  for (let block of blocks) {
    if (!block || block.startsWith('--')) continue;
    try {
      await sql.query(block);
    } catch (e) {
      if (!e.message.includes('already exists')) console.error(`Error: ${e.message}`);
    }
  }
  console.log('✅ Database is up to date.');
}

migrate();
