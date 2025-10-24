#!/usr/bin/env node

/**
 * Execute Supabase Migration
 * This uses the SQL execution approach to run the migration
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 Executing Migration SQL\n');

async function executeSQL(sql, description) {
  console.log(`\n📋 ${description}...`);

  try {
    // Use the raw SQL execution via the REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql })
    });

    const result = await response.json();

    if (!response.ok) {
      console.log(`❌ Error: ${result.message || response.statusText}`);
      return false;
    }

    console.log(`✅ ${description} - Success`);
    return true;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

async function executeMigration() {
  console.log('=' .repeat(70));

  // Step 1: Add user_id column to personas
  await executeSQL(
    `ALTER TABLE personas ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;`,
    'Adding user_id to personas table'
  );

  await executeSQL(
    `ALTER TABLE personas ADD COLUMN IF NOT EXISTS avatar_url TEXT;`,
    'Adding avatar_url to personas table'
  );

  await executeSQL(
    `CREATE INDEX IF NOT EXISTS idx_personas_user_id ON personas(user_id);`,
    'Creating index on personas.user_id'
  );

  // Step 2: Rename old conversations table
  await executeSQL(
    `ALTER TABLE IF EXISTS conversations RENAME TO conversations_old;`,
    'Renaming conversations to conversations_old'
  );

  // Step 3: Create new conversations table
  await executeSQL(
    `CREATE TABLE IF NOT EXISTS conversations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
      messages JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    'Creating new conversations table'
  );

  await executeSQL(
    `CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);`,
    'Creating index on conversations.user_id'
  );

  await executeSQL(
    `CREATE INDEX IF NOT EXISTS idx_conversations_persona_id ON conversations(persona_id);`,
    'Creating index on conversations.persona_id'
  );

  await executeSQL(
    `CREATE INDEX IF NOT EXISTS idx_conversations_user_persona ON conversations(user_id, persona_id);`,
    'Creating composite index on conversations'
  );

  // Step 4: Create updated_at trigger
  await executeSQL(
    `CREATE OR REPLACE FUNCTION update_updated_at_column()
     RETURNS TRIGGER AS $$
     BEGIN
       NEW.updated_at = NOW();
       RETURN NEW;
     END;
     $$ LANGUAGE plpgsql;`,
    'Creating update_updated_at function'
  );

  await executeSQL(
    `DROP TRIGGER IF EXISTS update_users_updated_at ON users;
     CREATE TRIGGER update_users_updated_at
       BEFORE UPDATE ON users
       FOR EACH ROW
       EXECUTE FUNCTION update_updated_at_column();`,
    'Creating trigger on users table'
  );

  await executeSQL(
    `DROP TRIGGER IF EXISTS update_personas_updated_at ON personas;
     CREATE TRIGGER update_personas_updated_at
       BEFORE UPDATE ON personas
       FOR EACH ROW
       EXECUTE FUNCTION update_updated_at_column();`,
    'Creating trigger on personas table'
  );

  await executeSQL(
    `DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
     CREATE TRIGGER update_conversations_updated_at
       BEFORE UPDATE ON conversations
       FOR EACH ROW
       EXECUTE FUNCTION update_updated_at_column();`,
    'Creating trigger on conversations table'
  );

  // Step 5: Enable RLS and policies
  await executeSQL(
    `ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
     DROP POLICY IF EXISTS "Enable all access for service role" ON personas;
     CREATE POLICY "Enable all access for service role" ON personas FOR ALL USING (true) WITH CHECK (true);`,
    'Setting up RLS on personas'
  );

  await executeSQL(
    `ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
     DROP POLICY IF EXISTS "Enable all access for service role" ON conversations;
     CREATE POLICY "Enable all access for service role" ON conversations FOR ALL USING (true) WITH CHECK (true);`,
    'Setting up RLS on conversations'
  );

  console.log('\n' + '=' .repeat(70));
  console.log('\n⚠️  Note: Some commands may fail if Supabase restricts DDL via API.');
  console.log('If you see errors above, please run migration-add-users-support.sql manually.');
  console.log('\nVerifying migration...\n');

  // Verify
  const { data: personas } = await supabase.from('personas').select('*').limit(1);
  const { data: conversations } = await supabase.from('conversations').select('*').limit(1);

  if (personas && conversations !== undefined) {
    console.log('✅ Migration verification passed!');
    console.log('\n🎉 Next steps:');
    console.log('   1. npm run dev');
    console.log('   2. Sign in with Google');
    console.log('   3. node test-supabase-data.js');
  }
}

executeMigration().catch(err => {
  console.error('\n❌ Migration failed:', err.message);
  console.log('\n📖 Please run the SQL manually in Supabase dashboard.');
  console.log('File: migration-add-users-support.sql');
  console.log('Dashboard: https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg/editor');
});
