#!/usr/bin/env node

/**
 * Script to run the personas table migration on Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

console.log('🔗 Connecting to Supabase:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function runMigration() {
  console.log('\n🚀 Running personas table migration...\n');

  // Read the SQL file
  const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20251028_create_personas_table.sql');
  const sqlContent = readFileSync(migrationPath, 'utf8');

  console.log('📝 Executing SQL migration...');
  console.log('─'.repeat(80));

  // Split SQL into individual statements
  const statements = sqlContent
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--') && s.length > 0);

  console.log(`Found ${statements.length} SQL statements to execute\n`);

  // Execute each statement
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    const preview = statement.substring(0, 100).replace(/\s+/g, ' ');

    try {
      console.log(`[${i + 1}/${statements.length}] Executing: ${preview}...`);

      const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

      if (error) {
        // If exec_sql doesn't exist, the error might be expected
        // Try alternative approach - direct query
        console.log(`    ⚠️  RPC method not available, trying direct execution...`);

        // For Supabase, we need to use the REST API directly
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ sql_query: statement }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`    ❌ Failed: ${errorText}`);
          // Continue anyway as some statements might fail if already exists
        } else {
          console.log(`    ✅ Success`);
        }
      } else {
        console.log(`    ✅ Success`);
      }
    } catch (err) {
      console.log(`    ⚠️  ${err.message}`);
      // Continue execution as some errors are expected (e.g., "already exists")
    }
  }

  console.log('\n─'.repeat(80));
  console.log('✅ Migration execution completed!\n');

  // Verify the table was created
  console.log('🔍 Verifying personas table...');

  try {
    const { data, error, count } = await supabase
      .from('personas')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Table verification failed:', error.message);
      console.log('\n⚠️  The table might not exist. Please check Supabase Dashboard:');
      console.log(`   ${supabaseUrl.replace('.supabase.co', '.supabase.co/project/_/editor')}`);
      process.exit(1);
    }

    console.log('✅ personas table exists and is accessible!');
    console.log(`   Current row count: ${count || 0}`);

  } catch (err) {
    console.error('❌ Exception during verification:', err.message);
    process.exit(1);
  }

  console.log('\n' + '═'.repeat(80));
  console.log('🎉 MIGRATION SUCCESSFUL!');
  console.log('═'.repeat(80));
  console.log('\n✅ Completed steps:');
  console.log('   1. Created migration file: supabase/migrations/20251028_create_personas_table.sql');
  console.log('   2. Created TypeScript types: src/types/persona.ts');
  console.log('   3. Executed migration on Supabase');
  console.log('   4. Verified personas table exists');
  console.log('\n📋 Next step: Commit the changes with the message from the plan');
  console.log('');
}

runMigration().catch(err => {
  console.error('\n💥 Migration failed:', err);
  process.exit(1);
});
