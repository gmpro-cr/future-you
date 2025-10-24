/**
 * Database Setup Script
 *
 * This script automatically creates the necessary database tables in Supabase
 * Run this once before using the backend storage features
 *
 * Usage: node scripts/setup-database.js
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read Supabase credentials from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required variables:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function setupDatabase() {
  console.log('🔧 Setting up Supabase database...\n');

  // Read the SQL schema file
  const schemaPath = path.join(__dirname, '..', 'supabase-schema.sql');

  if (!fs.existsSync(schemaPath)) {
    console.error(`❌ Schema file not found: ${schemaPath}`);
    process.exit(1);
  }

  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

  console.log('📝 Executing database schema...');
  console.log('   This will create:');
  console.log('   - users table');
  console.log('   - personas table');
  console.log('   - conversations table');
  console.log('   - RLS policies');
  console.log('   - Indexes\n');

  try {
    // Execute the schema SQL
    // Note: Supabase client doesn't support multi-statement SQL execution
    // We need to use the REST API directly
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
      },
      body: JSON.stringify({ query: schemaSql }),
    });

    if (!response.ok) {
      // If exec_sql doesn't work, we need to use the Supabase dashboard
      console.log('⚠️  Cannot execute SQL directly via API');
      console.log('\n📋 Manual Setup Required:');
      console.log('   1. Go to https://supabase.com/dashboard');
      console.log('   2. Select your project');
      console.log('   3. Click "SQL Editor" in the sidebar');
      console.log('   4. Click "+ New query"');
      console.log('   5. Copy the contents of: supabase-schema.sql');
      console.log('   6. Paste into the SQL Editor');
      console.log('   7. Click "Run" button\n');
      console.log('✅ After running the schema, your backend storage will be ready!\n');
      return;
    }

    console.log('✅ Database schema executed successfully!\n');

    // Verify tables were created
    console.log('🔍 Verifying tables...');

    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['users', 'personas', 'conversations']);

    if (tablesError) {
      console.log('⚠️  Could not verify tables automatically');
    } else {
      console.log(`   ✓ Found ${tables?.length || 0} tables`);
      tables?.forEach(t => console.log(`     - ${t.table_name}`));
    }

    console.log('\n✅ Backend storage is ready!');
    console.log('\n📖 Next steps:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Sign in with Google');
    console.log('   3. Check browser console for sync messages');
    console.log('   4. Create personas and start chatting');
    console.log('   5. Your data will automatically sync to backend!\n');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    console.log('\n📋 Manual Setup Required:');
    console.log('   1. Go to https://supabase.com/dashboard');
    console.log('   2. Select your project');
    console.log('   3. Click "SQL Editor" in the sidebar');
    console.log('   4. Click "+ New query"');
    console.log('   5. Copy the contents of: supabase-schema.sql');
    console.log('   6. Paste into the SQL Editor');
    console.log('   7. Click "Run" button\n');
    process.exit(1);
  }
}

// Run setup
setupDatabase().catch(console.error);
