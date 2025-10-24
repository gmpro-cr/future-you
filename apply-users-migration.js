#!/usr/bin/env node

/**
 * Apply Users Table Migration
 * This script helps apply the migration to add Google Sign-In support
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('🚀 Applying Users Table Migration for Google Sign-In Support\n');
console.log('=' .repeat(70));

async function checkTableExists(tableName) {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(1);

  if (error && error.message.includes('does not exist')) {
    return false;
  }
  return true;
}

async function createUsersTable() {
  console.log('\n📋 Attempting to create users table...');

  // Try to insert a test user to see if table exists
  const { data: tableExists } = await supabase
    .from('users')
    .select('id')
    .limit(1);

  if (tableExists !== null) {
    console.log('✅ Users table already exists!');
    return true;
  }

  console.log('❌ Users table does not exist.');
  console.log('\n⚠️  Supabase does not allow CREATE TABLE via API.');
  console.log('   You must run the SQL migration manually.\n');

  return false;
}

async function addUserIdToPersonas() {
  console.log('\n📋 Checking personas table structure...');

  const { data, error } = await supabase
    .from('personas')
    .select('*')
    .limit(1);

  if (error) {
    console.log('❌ Error checking personas:', error.message);
    return false;
  }

  if (data && data.length > 0) {
    if ('user_id' in data[0]) {
      console.log('✅ Personas table has user_id column!');
      return true;
    } else {
      console.log('❌ Personas table missing user_id column.');
      console.log('   Current structure:', Object.keys(data[0]).join(', '));
      return false;
    }
  }

  console.log('ℹ️  Personas table exists but is empty.');
  return null;
}

async function main() {
  let needsMigration = false;

  // Step 1: Check users table
  console.log('\n🔍 Step 1: Checking users table...');
  const usersExists = await checkTableExists('users');

  if (!usersExists) {
    console.log('❌ Users table is MISSING');
    needsMigration = true;
  } else {
    console.log('✅ Users table exists');

    // Check structure
    const { data } = await supabase.from('users').select('*').limit(1);
    if (data && data.length > 0) {
      console.log('   Columns:', Object.keys(data[0]).join(', '));
    }
  }

  // Step 2: Check personas table
  console.log('\n🔍 Step 2: Checking personas table...');
  const personasResult = await addUserIdToPersonas();

  if (personasResult === false) {
    needsMigration = true;
  }

  // Step 3: Check conversations table structure
  console.log('\n🔍 Step 3: Checking conversations table...');
  const { data: convData } = await supabase
    .from('conversations')
    .select('*')
    .limit(1);

  if (convData && convData.length > 0) {
    const hasUserId = 'user_id' in convData[0];
    const hasMessages = 'messages' in convData[0];

    if (hasUserId && hasMessages) {
      console.log('✅ Conversations table has correct structure');
    } else {
      console.log('❌ Conversations table needs migration');
      console.log('   Current columns:', Object.keys(convData[0]).join(', '));
      console.log('   Expected: user_id, persona_id, messages (JSONB)');
      needsMigration = true;
    }
  }

  console.log('\n' + '=' .repeat(70));

  if (needsMigration) {
    console.log('\n🔴 MIGRATION REQUIRED\n');
    console.log('Your database needs to be updated to support Google Sign-In.\n');
    console.log('📋 Steps to Apply Migration:\n');
    console.log('1️⃣  Open Supabase SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg/editor\n');
    console.log('2️⃣  Open this file in a text editor:');
    console.log('   migration-add-users-support.sql\n');
    console.log('3️⃣  Copy ALL the SQL from that file\n');
    console.log('4️⃣  Paste into the Supabase SQL Editor\n');
    console.log('5️⃣  Click the "Run" button (or press Cmd/Ctrl + Enter)\n');
    console.log('6️⃣  Wait for "Success" message\n');
    console.log('7️⃣  Run this script again to verify:');
    console.log('   node apply-users-migration.js\n');
    console.log('=' .repeat(70));
    console.log('\n📖 For detailed instructions, see: BACKEND-DATA-SYNC-FIX.md\n');
  } else {
    console.log('\n✅ MIGRATION COMPLETE!\n');
    console.log('All required tables and columns exist.\n');
    console.log('🧪 Next Steps:\n');
    console.log('1. Start the dev server:');
    console.log('   npm run dev\n');
    console.log('2. Sign in with Google at:');
    console.log('   http://localhost:3000\n');
    console.log('3. Check browser console for:');
    console.log('   ✅ Google user data saved automatically');
    console.log('   🔄 Starting initial sync with backend...');
    console.log('   ✅ Initial sync completed\n');
    console.log('4. Verify data was saved:');
    console.log('   node test-supabase-data.js\n');
    console.log('=' .repeat(70));
  }
}

main().catch(error => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
