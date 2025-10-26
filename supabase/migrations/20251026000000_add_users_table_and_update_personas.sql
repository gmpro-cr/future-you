-- Migration: Add users table and update personas table
-- Date: 2025-10-26
-- Description: Adds users table for Google authenticated users and updates personas table with is_public, session_identifier, and user_id fields

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

-- Add indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Add indexes for new personas columns
CREATE INDEX IF NOT EXISTS idx_personas_session_identifier ON personas(session_identifier);
CREATE INDEX IF NOT EXISTS idx_personas_user_id ON personas(user_id);
CREATE INDEX IF NOT EXISTS idx_personas_is_public ON personas(is_public);

-- Add trigger for users updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on users and personas tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;

-- Add RLS policies (Allow all for MVP - can be tightened later)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Allow user operations'
  ) THEN
    CREATE POLICY "Allow user operations" ON users FOR ALL USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'personas' AND policyname = 'Allow persona operations'
  ) THEN
    CREATE POLICY "Allow persona operations" ON personas FOR ALL USING (true);
  END IF;
END $$;

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'Migration 20251026000000_add_users_table_and_update_personas completed successfully';
END $$;
