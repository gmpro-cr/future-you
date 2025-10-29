const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Extract project ref from URL
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!projectRef) {
  console.error('❌ Could not extract project reference from Supabase URL');
  process.exit(1);
}

// Construct PostgreSQL connection string
// Format: postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
// Note: We need the database password which is not in the env vars
// The service key won't work for direct Postgres connection

console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 Task 1: Database Schema Migration - Personas Table');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('⚠️  Direct PostgreSQL connection requires database password');
console.log('');
console.log('To run this migration, please use ONE of these methods:');
console.log('');
console.log('METHOD 1: Supabase Dashboard (RECOMMENDED)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('1. Go to: https://supabase.com/dashboard/project/' + projectRef);
console.log('2. Click "SQL Editor" in left sidebar');
console.log('3. Click "New query"');
console.log('4. Copy contents of: scripts/migration-sql-to-run.sql');
console.log('5. Paste into editor and click "Run"');
console.log('6. Verify success in Database → Tables');
console.log('');
console.log('METHOD 2: Supabase CLI (if installed)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('1. Run: supabase db push');
console.log('');
console.log('METHOD 3: Direct psql (if you have database password)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('1. psql -h db.' + projectRef + '.supabase.co \\');
console.log('      -p 5432 -d postgres -U postgres');
console.log('2. Enter database password when prompted');
console.log('3. Copy/paste SQL from scripts/migration-sql-to-run.sql');
console.log('');
console.log('After running migration, verify with:');
console.log('  node scripts/verify-personas-migration.js');
console.log('');
