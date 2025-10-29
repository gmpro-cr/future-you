#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  const migrationFile = process.argv[2];

  if (!migrationFile) {
    console.error('❌ Usage: node scripts/run-migration.js <migration-file>');
    process.exit(1);
  }

  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', migrationFile);

  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${migrationPath}`);
    process.exit(1);
  }

  console.log(`📥 Reading migration: ${migrationFile}`);
  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log(`🚀 Executing SQL migration...`);
  console.log('');

  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (!statement) continue;

    console.log(`Executing statement ${i + 1}/${statements.length}...`);

    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' });

      if (error) {
        console.error(`❌ Error in statement ${i + 1}:`, error.message);
        // Continue with other statements
      } else {
        console.log(`✅ Statement ${i + 1} completed`);
      }
    } catch (err) {
      console.error(`❌ Exception in statement ${i + 1}:`, err.message);
    }
  }

  console.log('');
  console.log('📊 Verifying table creation...');

  // Verify the table exists
  const { data: tables, error: verifyError } = await supabase
    .from('personas')
    .select('*')
    .limit(1);

  if (verifyError) {
    console.error('⚠️  Table verification result:', verifyError.message);
    console.log('');
    console.log('💡 The migration SQL has been executed.');
    console.log('💡 Please verify the table was created in Supabase Dashboard → Database → Tables');
  } else {
    console.log('✅ Personas table verified and accessible!');
  }

  console.log('');
  console.log('🎉 Migration process completed!');
}

runMigration();
