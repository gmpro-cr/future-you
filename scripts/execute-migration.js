const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeMigration() {
  console.log('');
  console.log('🚀 Executing Personas Table Migration');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  // Read the full migration SQL
  const migrationPath = path.join(__dirname, 'migration-sql-to-run.sql');
  const fullSQL = fs.readFileSync(migrationPath, 'utf8');

  console.log('📋 Migration SQL loaded');
  console.log('');
  console.log('⚠️  Note: Supabase JS client cannot execute DDL statements directly.');
  console.log('   Migration must be run via Supabase Dashboard SQL Editor.');
  console.log('');
  console.log('📋 SQL has been prepared in: scripts/migration-sql-to-run.sql');
  console.log('');
  console.log('Next steps:');
  console.log('1. Open Supabase Dashboard SQL Editor');
  console.log('2. Copy/paste the SQL from migration-sql-to-run.sql');
  console.log('3. Run the SQL');
  console.log('4. Execute: node scripts/verify-personas-migration.js');
  console.log('');
  console.log('Direct link: https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg/sql/new');
  console.log('');
}

executeMigration();
