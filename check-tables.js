#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('🔍 Checking Supabase Tables...\n');

async function checkTable(tableName) {
  const { data, error, count } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: false });

  if (error) {
    console.log(`❌ ${tableName}: ${error.message}`);
    return false;
  } else {
    console.log(`✅ ${tableName}: ${count || data.length} records`);
    if (data && data.length > 0) {
      console.log(`   Sample:`, JSON.stringify(data[0], null, 2).substring(0, 200) + '...');
    }
    return true;
  }
}

async function main() {
  await checkTable('users');
  await checkTable('personas');
  await checkTable('conversations');

  console.log('\n📊 Summary:');
  console.log('If you see errors above, you need to apply the schema.');
  console.log('Run the SQL in supabase-schema.sql in your Supabase SQL Editor.');
  console.log('\nSupabase Dashboard: https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg');
}

main();
