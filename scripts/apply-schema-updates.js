const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.production') });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQL(sql, description) {
  console.log(`\n📝 ${description}...`);
  try {
    const { data, error } = await supabase.rpc('exec', { query: sql });
    
    if (error) {
      // Try alternative method - direct query
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ query: sql })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Failed: ${errorText}`);
        return false;
      }
    }
    
    console.log(`✅ ${description} - Success`);
    return true;
  } catch (err) {
    console.error(`❌ ${description} - Error:`, err.message);
    return false;
  }
}

async function runMigration() {
  console.log('🚀 Starting schema migration...\n');

  // Since Supabase doesn't support arbitrary SQL execution via the client,
  // we'll use the SQL Editor approach via the Management API
  
  console.log('⚠️  This script requires manual migration.');
  console.log('\n📋 Please run the following SQL in Supabase SQL Editor:');
  console.log('   https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg/sql/new\n');

  const migrationSQL = `
-- Migration: Add users table and update personas table
-- Date: 2025-10-26

-- Add users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  google_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  image TEXT,
  locale TEXT,
  email_verified BOOLEAN DEFAULT false,
  birthdate DATE,
  country TEXT,
  profession TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Add new columns to personas table
ALTER TABLE personas ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS session_identifier TEXT;
ALTER TABLE personas ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_personas_session_identifier ON personas(session_identifier);
CREATE INDEX IF NOT EXISTS idx_personas_user_id ON personas(user_id);
CREATE INDEX IF NOT EXISTS idx_personas_is_public ON personas(is_public);

-- Add trigger for users updated_at (reuse existing function)
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Allow user operations" ON users FOR ALL USING (true);
CREATE POLICY "Allow persona operations" ON personas FOR ALL USING (true);
`;

  console.log('═'.repeat(80));
  console.log(migrationSQL);
  console.log('═'.repeat(80));

  console.log('\n\n📖 Or use the Supabase CLI:');
  console.log('   supabase db push\n');

  console.log('✅ Migration SQL prepared and ready to execute.');
  console.log('\n🔗 Direct link to SQL Editor:');
  console.log('   https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg/sql/new');
}

runMigration().catch(console.error);
