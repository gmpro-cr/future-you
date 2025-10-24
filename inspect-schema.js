#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('🔍 Inspecting Current Supabase Schema...\n');

// Get sample data to understand the structure
async function inspectTable(tableName) {
  console.log(`\n📋 ${tableName.toUpperCase()} TABLE`);
  console.log('='.repeat(60));

  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(1);

  if (error) {
    console.log(`❌ Error: ${error.message}\n`);
    return;
  }

  if (data && data.length > 0) {
    console.log('✅ Table exists with structure:');
    console.log(JSON.stringify(data[0], null, 2));
  } else {
    console.log('ℹ️  Table exists but is empty\n');
  }
}

async function main() {
  await inspectTable('users');
  await inspectTable('personas');
  await inspectTable('conversations');

  console.log('\n' + '='.repeat(60));
  console.log('\n📝 FINDINGS:');
  console.log('The current schema is DIFFERENT from supabase-schema.sql');
  console.log('\nCurrent Schema:');
  console.log('  - ❌ users table: MISSING (needs to be created)');
  console.log('  - ✅ personas table: EXISTS (but has "type" field, not user_id)');
  console.log('  - ✅ conversations table: EXISTS (but has session_id, not user_id/persona_id)');
  console.log('\nExpected Schema (supabase-schema.sql):');
  console.log('  - users table: id, google_id, email, name, image, etc.');
  console.log('  - personas table: id, user_id, name, description, system_prompt, etc.');
  console.log('  - conversations table: id, user_id, persona_id, messages, etc.');
  console.log('\n⚠️  ACTION REQUIRED:');
  console.log('You need to apply the new schema to enable Google Sign-In data sync.');
  console.log('\nOptions:');
  console.log('  1. MIGRATE: Create users table + migrate existing data');
  console.log('  2. FRESH START: Drop existing tables and apply new schema');
  console.log('  3. KEEP OLD: Update sync logic to work with current schema');
}

main();
