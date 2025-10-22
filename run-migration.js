#!/usr/bin/env node

/**
 * Database Migration Script
 * Fixes the persona_type constraint issue for custom personas
 *
 * This script updates existing conversations to have persona_type = 'custom'
 * The ALTER TABLE commands need to be run manually in Supabase SQL Editor
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
const envFile = readFileSync(join(__dirname, '.env.local'), 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1]] = match[2];
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🔄 Database Migration for Custom Personas\n');
  console.log('=' .repeat(50));

  try {
    // Test connection
    console.log('\n📡 Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('conversations')
      .select('id')
      .limit(1);

    if (testError) {
      throw new Error(`Cannot connect to database: ${testError.message}`);
    }
    console.log('✅ Connected to Supabase successfully\n');

    // Update existing conversations
    console.log('🔄 Updating existing conversations...');
    const { count, error: updateError } = await supabase
      .from('conversations')
      .update({ persona_type: 'custom' })
      .is('persona_type', null)
      .select('*', { count: 'exact', head: true });

    if (updateError) {
      console.warn('⚠️  Note:', updateError.message);
      console.log('\nThis is expected if no rows have NULL persona_type.');
    } else {
      console.log(`✅ Updated ${count || 0} conversation(s)\n`);
    }

    console.log('=' .repeat(50));
    console.log('\n⚠️  IMPORTANT: Manual SQL Required\n');
    console.log('The following SQL commands MUST be run in Supabase SQL Editor:');
    console.log('\n```sql');
    console.log('-- Make persona_type nullable');
    console.log('ALTER TABLE conversations');
    console.log('ALTER COLUMN persona_type DROP NOT NULL;');
    console.log('');
    console.log('-- Set default value');
    console.log('ALTER TABLE conversations');
    console.log('ALTER COLUMN persona_type SET DEFAULT \'custom\';');
    console.log('```');
    console.log('\nSteps:');
    console.log('1. Go to: https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg/sql');
    console.log('2. Copy the SQL above');
    console.log('3. Paste and click "Run"');
    console.log('4. Refresh your app and try chatting with a custom persona\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nPlease follow the manual steps in DATABASE-FIX.md');
    process.exit(1);
  }
}

// Run the migration
runMigration();
