#!/usr/bin/env node

/**
 * Setup Verification Script for Esperit
 * Run this after executing the database schema in Supabase
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySetup() {
  console.log('\n🔍 Verifying Esperit Setup...\n');

  // 1. Check Supabase connection
  console.log('1️⃣  Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('personas').select('count');
    if (error) {
      if (error.message.includes('does not exist')) {
        console.log('   ❌ Database tables not found');
        console.log('   → Please run the schema.sql in Supabase SQL Editor');
        console.log('   → See SUPABASE-SETUP.md for instructions\n');
        return false;
      }
      throw error;
    }
    console.log('   ✅ Supabase connected successfully\n');
  } catch (err) {
    console.log('   ❌ Connection failed:', err.message, '\n');
    return false;
  }

  // 2. Check personas table
  console.log('2️⃣  Checking personas table...');
  try {
    const { data: personas, error } = await supabase
      .from('personas')
      .select('*')
      .order('created_at');

    if (error) throw error;

    if (!personas || personas.length === 0) {
      console.log('   ❌ No personas found');
      console.log('   → Make sure you ran the INSERT statements in schema.sql\n');
      return false;
    }

    if (personas.length !== 7) {
      console.log(`   ⚠️  Found ${personas.length} personas (expected 7)`);
    } else {
      console.log('   ✅ All 7 personas found:');
      personas.forEach((p) => {
        console.log(`      ${p.emoji} ${p.name} (${p.type})`);
      });
    }
    console.log('');
  } catch (err) {
    console.log('   ❌ Failed to fetch personas:', err.message, '\n');
    return false;
  }

  // 3. Check other tables
  console.log('3️⃣  Checking other tables...');
  const tables = ['sessions', 'conversations', 'messages', 'feedback'];
  let allTablesExist = true;

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('count').limit(1);
      if (error) throw error;
      console.log(`   ✅ ${table} table exists`);
    } catch (err) {
      console.log(`   ❌ ${table} table missing`);
      allTablesExist = false;
    }
  }
  console.log('');

  // 4. Check Gemini API key
  console.log('4️⃣  Checking Gemini API key...');
  if (process.env.GEMINI_API_KEY) {
    console.log('   ✅ Gemini API key configured\n');
  } else {
    console.log('   ❌ GEMINI_API_KEY not found in .env.local\n');
    return false;
  }

  // Summary
  if (allTablesExist) {
    console.log('🎉 Setup Complete!\n');
    console.log('Next steps:');
    console.log('1. Visit http://localhost:3000');
    console.log('2. Click "Start Your Journey"');
    console.log('3. Select a persona (try Entrepreneur 🚀)');
    console.log('4. Send a message to your future self!\n');
    return true;
  } else {
    console.log('⚠️  Setup incomplete. Please follow SUPABASE-SETUP.md\n');
    return false;
  }
}

verifySetup().then((success) => {
  process.exit(success ? 0 : 1);
});
