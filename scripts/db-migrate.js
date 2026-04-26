/**
 * NEON DATABASE MIGRATION SCRIPT
 * 
 * Usage:
 * 1. Ensure your .env.local has NEXT_PUBLIC_DATABASE_URL
 * 2. Run: node scripts/db-migrate.js
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.NEXT_PUBLIC_DATABASE_URL;

async function migrate() {
  if (!DATABASE_URL) {
    console.error('❌ Error: NEXT_PUBLIC_DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  console.log('🚀 Starting Database Migration...');
  const sql = neon(DATABASE_URL);

  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Splitting by semicolon is risky but works for basic schemas.
    // However, Neon's serverless driver can handle multiple statements 
    // if they are properly formatted.
    
    console.log('⏳ Executing schema.sql...');
    
    // We run the whole block. Tagged template isn't strictly needed for the raw SQL
    // but the driver expects a certain format.
    await sql.query(schemaSql);
    
    console.log('✅ Migration successful! Your database is now up to date.');
  } catch (error) {
    console.error('❌ Migration failed:');
    console.error(error.message);
    console.log('\nTip: Try copying the contents of scripts/schema.sql directly into the Neon SQL Editor.');
  }
}

migrate();
