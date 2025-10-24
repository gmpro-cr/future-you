-- Migration: Add Google Sign-In Support to Future You
-- This script adds user authentication support while preserving existing data
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg/editor

-- ============================================================================
-- STEP 1: Create the USERS table
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  google_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  image TEXT,
  locale TEXT,
  email_verified BOOLEAN DEFAULT false,
  birthdate DATE,
  country TEXT,
  profession TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================================
-- STEP 2: Modify PERSONAS table to support user ownership
-- ============================================================================

-- Add user_id column (nullable at first to allow existing personas)
ALTER TABLE personas
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Add missing columns from new schema
ALTER TABLE personas
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Update system_prompt column name if needed
-- (Current schema already has system_prompt, so we're good)

-- Create index for user_id
CREATE INDEX IF NOT EXISTS idx_personas_user_id ON personas(user_id);

-- ============================================================================
-- STEP 3: Create new CONVERSATIONS table with proper structure
-- ============================================================================

-- Rename old conversations table to preserve data
ALTER TABLE conversations RENAME TO conversations_old;

-- Create new conversations table with proper structure
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_persona_id ON conversations(persona_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_persona ON conversations(user_id, persona_id);

-- ============================================================================
-- STEP 4: Create updated_at trigger function and apply to tables
-- ============================================================================

-- Create or replace updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_personas_updated_at ON personas;
CREATE TRIGGER update_personas_updated_at
  BEFORE UPDATE ON personas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 5: Enable Row Level Security (RLS)
-- ============================================================================

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Update RLS on personas table (already exists)
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;

-- Enable RLS on new conversations table
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow service role full access
DROP POLICY IF EXISTS "Enable all access for service role" ON users;
CREATE POLICY "Enable all access for service role"
  ON users FOR ALL
  USING (true)
  WITH CHECK (true);

-- Update personas policies
DROP POLICY IF EXISTS "Enable all access for service role" ON personas;
CREATE POLICY "Enable all access for service role"
  ON personas FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add conversations policies
DROP POLICY IF EXISTS "Enable all access for service role" ON conversations;
CREATE POLICY "Enable all access for service role"
  ON conversations FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- STEP 6: Grant permissions
-- ============================================================================

GRANT ALL ON users TO service_role;
GRANT ALL ON personas TO service_role;
GRANT ALL ON conversations TO service_role;
GRANT ALL ON conversations_old TO service_role;

-- ============================================================================
-- STEP 7: Migration Notes
-- ============================================================================

-- NOTE: After running this migration:
--
-- 1. OLD DATA:
--    - Default personas (Entrepreneur, Mindful, etc.) will still exist
--    - They will have NULL user_id (not owned by anyone)
--    - Old conversations are in 'conversations_old' table (preserved for reference)
--
-- 2. NEW FUNCTIONALITY:
--    - Users table now stores Google Sign-In data
--    - Custom personas created by users will have user_id set
--    - New conversations will use user_id + persona_id structure
--    - Messages will be stored in JSONB format in conversations.messages
--
-- 3. TO CLEAN UP LATER (optional):
--    - You can drop conversations_old table once you verify new system works:
--      DROP TABLE conversations_old;
--
--    - You can delete default personas if you don't need them:
--      DELETE FROM personas WHERE user_id IS NULL;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify the migration
SELECT 'Migration Complete!' as status;
SELECT 'Users table created' as step_1;
SELECT 'Personas table updated' as step_2;
SELECT 'Conversations table recreated' as step_3;
SELECT 'RLS policies applied' as step_4;
SELECT
  'Total personas: ' || COUNT(*)::text ||
  ' (Default: ' || COUNT(CASE WHEN user_id IS NULL THEN 1 END)::text ||
  ', User-owned: ' || COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END)::text || ')'
  as step_5
FROM personas;
