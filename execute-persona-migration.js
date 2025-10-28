import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

console.log('🔧 Supabase Persona Privacy Migration');
console.log('=' .repeat(60));

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('\n📡 Testing connection...');
    
    // Test connection by querying personas
    const { data: testData, error: testError } = await supabase
      .from('personas')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.error('❌ Connection failed:', testError.message);
      process.exit(1);
    }
    
    console.log('✅ Connected to Supabase');
    
    // Check if column exists
    if (testData && testData.length > 0) {
      const columns = Object.keys(testData[0]);
      console.log('\n📊 Current columns:', columns.join(', '));
      
      if (columns.includes('session_identifier')) {
        console.log('\n✅ Column "session_identifier" already exists!');
        console.log('✅ Migration appears to be already applied.');
        return;
      }
    }
    
    console.log('\n⚠️  Column "session_identifier" not found.');
    console.log('\n🚨 MANUAL ACTION REQUIRED:');
    console.log('\nThe Supabase JS client cannot execute DDL (ALTER TABLE) commands.');
    console.log('You must run this SQL manually:');
    console.log('\n' + '─'.repeat(60));
    console.log(`
-- Add session_identifier column
ALTER TABLE personas
  ADD COLUMN IF NOT EXISTS session_identifier TEXT;

-- Create index for faster queries  
CREATE INDEX IF NOT EXISTS idx_personas_session_identifier
  ON personas(session_identifier);

-- Verify
SELECT 'Session identifier column added successfully' as status;
`);
    console.log('─'.repeat(60));
    console.log('\n📍 Run this at:');
    console.log('   https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg/editor');
    console.log('\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

runMigration();
