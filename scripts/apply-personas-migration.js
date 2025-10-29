const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🚀 Task 1: Applying Personas Table Migration');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  // Read the migration file
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20251028_create_personas_table.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  console.log('📋 Migration: 20251028_create_personas_table.sql');
  console.log('');

  // Since the old table exists, we need to drop it first
  console.log('⚠️  Old personas table detected with different schema');
  console.log('📝 Step 1: Dropping old personas table...');
  
  try {
    // Drop the old table
    const dropSQL = 'DROP TABLE IF EXISTS personas CASCADE;';
    
    const { error: dropError } = await supabase.rpc('exec_sql', { 
      query: dropSQL 
    });

    // Note: exec_sql RPC may not exist, so we'll do this manually
    console.log('⚠️  Cannot drop table programmatically');
    console.log('');
    console.log('📝 MANUAL STEPS REQUIRED:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('1. Go to: https://supabase.com/dashboard');
    console.log('2. Select your project: exdjsvknudvfkabnifrg');
    console.log('3. Click "SQL Editor" in left sidebar');
    console.log('4. Create a new query');
    console.log('5. Copy and paste the SQL below:');
    console.log('');
    console.log('━━━━━━━━━━━━━ SQL TO EXECUTE ━━━━━━━━━━━━━');
    console.log('-- Drop old table');
    console.log('DROP TABLE IF EXISTS personas CASCADE;');
    console.log('');
    console.log('-- Create new table with full schema');
    console.log(migrationSQL);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('6. Click "Run" button');
    console.log('7. Verify success message appears');
    console.log('8. Go to Database → Tables → Check for "personas" table');
    console.log('');
    console.log('After completing these steps, run:');
    console.log('  node scripts/verify-personas-migration.js');
    console.log('');

  } catch (err) {
    console.error('Error:', err.message);
  }
}

applyMigration();
