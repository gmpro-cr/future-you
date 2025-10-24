-- Future You - Supabase Database Schema
-- Run this in your Supabase SQL Editor to create the necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table - stores user profile data
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

-- Personas table - stores custom AI personas
CREATE TABLE IF NOT EXISTS personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  emoji TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table - stores chat history
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_personas_user_id ON personas(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_persona_id ON conversations(persona_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_persona ON conversations(user_id, persona_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personas_updated_at
  BEFORE UPDATE ON personas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only access their own data

-- Users table policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (google_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (google_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  WITH CHECK (google_id = auth.jwt() ->> 'sub');

-- Personas table policies
CREATE POLICY "Users can view their own personas"
  ON personas FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE google_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can insert their own personas"
  ON personas FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM users WHERE google_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can update their own personas"
  ON personas FOR UPDATE
  USING (user_id IN (SELECT id FROM users WHERE google_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can delete their own personas"
  ON personas FOR DELETE
  USING (user_id IN (SELECT id FROM users WHERE google_id = auth.jwt() ->> 'sub'));

-- Conversations table policies
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE google_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can insert their own conversations"
  ON conversations FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM users WHERE google_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can update their own conversations"
  ON conversations FOR UPDATE
  USING (user_id IN (SELECT id FROM users WHERE google_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can delete their own conversations"
  ON conversations FOR DELETE
  USING (user_id IN (SELECT id FROM users WHERE google_id = auth.jwt() ->> 'sub'));

-- Grant permissions (for service role)
GRANT ALL ON users TO service_role;
GRANT ALL ON personas TO service_role;
GRANT ALL ON conversations TO service_role;
