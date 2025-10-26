const path = require('path');
const fs = require('fs');

// Load environment variables from .env.production (contains Supabase credentials)
require('dotenv').config({ path: path.join(__dirname, '..', '.env.production') });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '✓ (hidden)' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🚀 Starting users table migration...\n');

    // Read the migration SQL file
    const migrationPath = path.join(
      __dirname,
      '..',
      'supabase',
      'migrations',
      '20251026000000_add_users_table_and_update_personas.sql'
    );

    console.log('📁 Reading migration file:', migrationPath);
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📝 Migration SQL loaded successfully');
    console.log('🔧 Executing migration...\n');

    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL,
    });

    if (error) {
      // If exec_sql doesn't exist, try direct query
      console.log('⚠️  exec_sql RPC not available, trying direct query execution...');

      // Split SQL into individual statements and execute them
      const statements = migrationSQL
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement.length === 0) continue;

        try {
          const { error: stmtError } = await supabase.rpc('exec', {
            query: statement + ';',
          });

          if (stmtError) {
            console.error('❌ Error executing statement:', stmtError);
            console.error('Statement:', statement.substring(0, 100) + '...');
          }
        } catch (err) {
          console.error('❌ Statement execution failed:', err);
        }
      }

      console.log('\n⚠️  Migration executed with manual statement execution.');
      console.log('Please verify the migration manually in Supabase SQL Editor:\n');
      console.log('1. Go to: https://supabase.com/dashboard/project/_/sql/new');
      console.log('2. Copy the migration file contents');
      console.log('3. Run the SQL manually\n');
    } else {
      console.log('✅ Migration executed successfully!\n');
    }

    // Verify users table exists
    console.log('🔍 Verifying users table...');
    const { data: usersCheck, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (usersError) {
      if (usersError.code === '42P01') {
        console.error('❌ Users table does not exist. Migration may have failed.');
        console.log('\n📋 Please run the migration manually in Supabase SQL Editor.');
      } else {
        console.error('❌ Error checking users table:', usersError);
      }
    } else {
      console.log('✅ Users table exists and is accessible');
    }

    // Verify personas table has new columns
    console.log('🔍 Verifying personas table updates...');
    const { data: personas, error: personasError } = await supabase
      .from('personas')
      .select('id, is_public, session_identifier, user_id')
      .limit(1);

    if (personasError) {
      console.error('❌ Error checking personas table:', personasError);
      console.log('\n⚠️  Personas table may not have the new columns yet.');
    } else {
      console.log('✅ Personas table has new columns (is_public, session_identifier, user_id)');
    }

    console.log('\n✅ Migration verification complete!');
    console.log('\n📊 Next steps:');
    console.log('1. Test user sync: Sign in with Google and check if user is created');
    console.log('2. Test celebrity personas: Verify they appear for all users');
    console.log('3. Check browser console for any remaining sync errors');

  } catch (error) {
    console.error('💥 Migration failed:', error);
    console.error('\nError details:', error);
    process.exit(1);
  }
}

runMigration();
