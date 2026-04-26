const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });
dotenv.config(); // Fallback to .env

const DATABASE_URL = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL or NEXT_PUBLIC_DATABASE_URL is not set in environment variables.');
  process.exit(1);
}

async function initDb() {
  console.log('🚀 Connecting to Neon DB...');
  const sql = neon(DATABASE_URL);

  const schemaPath = path.join(__dirname, 'setup_db.sql');
  if (!fs.existsSync(schemaPath)) {
    console.error(`❌ Error: Schema file not found at ${schemaPath}`);
    process.exit(1);
  }

  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  // Split SQL by semicolons, but be careful with multi-line statements.
  // For Neon serverless, we can just send the whole block if it's one transaction,
  // or split it for better error reporting.
  
  console.log('📝 Executing schema...');
  
  try {
    // Neon's neon() function requires .query() for plain strings
    await sql.query(schemaSql);
    console.log('✅ Database initialized successfully!');
  } catch (error) {
    console.error('❌ Database Initialization Failed:');
    console.error(error.message);
    
    if (error.message.includes('syntax error')) {
      console.log('\nTip: If you have complex multi-statement SQL, you might need to run it directly in the Neon Console.');
    }
  }
}

initDb();
