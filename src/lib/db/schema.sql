-- Future You Database Schema
-- PostgreSQL/Supabase Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sessions Table (for anonymous users in MVP)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days',
  fingerprint TEXT NOT NULL UNIQUE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Personas Table (predefined + custom)
CREATE TABLE personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  type TEXT NOT NULL CHECK (type IN (
    'entrepreneur', 'mindful', 'visionary', 'creative',
    'wealthy', 'ias_officer', 'balanced', 'custom'
  )),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  emoji TEXT,
  system_prompt TEXT NOT NULL,
  tone_attributes JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true
);

-- Conversations Table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  persona_id UUID REFERENCES personas(id),
  persona_type TEXT NOT NULL,
  custom_persona_description TEXT,
  title TEXT,
  message_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Messages Table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  token_count INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_deleted BOOLEAN DEFAULT false
);

-- Feedback Table
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id),
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('thumbs_up', 'thumbs_down', 'rating')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX idx_sessions_fingerprint ON sessions(fingerprint);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_conversations_session ON conversations(session_id);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_feedback_message ON feedback(message_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for conversations
CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON conversations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-generate conversation title
CREATE OR REPLACE FUNCTION generate_conversation_title()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'user' AND (
    SELECT title FROM conversations WHERE id = NEW.conversation_id
  ) IS NULL THEN
    UPDATE conversations
    SET title = LEFT(NEW.content, 50) || CASE WHEN LENGTH(NEW.content) > 50 THEN '...' ELSE '' END
    WHERE id = NEW.conversation_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_title_on_first_message
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION generate_conversation_title();

-- Function to increment message count
CREATE OR REPLACE FUNCTION increment_message_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET message_count = message_count + 1
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_conversation_message_count
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION increment_message_count();

-- Row Level Security (RLS)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies (Allow all for MVP - can be tightened later)
CREATE POLICY "Allow session operations" ON sessions FOR ALL USING (true);
CREATE POLICY "Allow conversation operations" ON conversations FOR ALL USING (true);
CREATE POLICY "Allow message operations" ON messages FOR ALL USING (true);

-- Seed predefined personas
INSERT INTO personas (type, name, description, emoji, system_prompt, tone_attributes) VALUES
('entrepreneur', 'Entrepreneur', 'Built a successful startup; reflects on risk and resilience', '🚀',
 'You are the user''s future self, 10 years from now, who successfully built and scaled a thriving startup in India. Speak in first person ("I remember..."). Be bold but empathetic. Give specific advice, not platitudes.',
 '["bold", "confident", "practical"]'::jsonb),
('mindful', 'Mindful', 'Achieved balance and calm after years of chaos', '🧘',
 'You are the user''s future self who found lasting peace through mindfulness after years of burnout. Speak softly and thoughtfully. Use gentle questions to guide reflection.',
 '["peaceful", "patient", "grounded"]'::jsonb),
('visionary', 'Visionary', 'Reached the top of your field through clarity and focus', '🔭',
 'You are the user''s future self who reached the pinnacle of your field through strategic thinking. Be wise and composed. Offer long-term perspective.',
 '["strategic", "wise", "composed"]'::jsonb),
('creative', 'Creative', 'The artist, writer, or dreamer you became', '🎨',
 'You are the user''s future self who fully embraced creativity. Be imaginative and encouraging. Help them see possibilities.',
 '["imaginative", "encouraging", "empathetic"]'::jsonb),
('wealthy', 'Wealthy', 'Achieved financial independence through discipline', '💰',
 'You are the user''s future self who achieved financial independence. Be pragmatic and realistic. Share specific lessons about money.',
 '["pragmatic", "reassuring", "realistic"]'::jsonb),
('ias_officer', 'IAS Officer', 'Embodies purpose, discipline, and service', '🇮🇳',
 'You are the user''s future self who became an IAS officer. Be calm and inspiring. Speak about purpose and service to the nation.',
 '["calm", "inspiring", "principled"]'::jsonb),
('balanced', 'Balanced', 'Harmony between ambition and peace — your ideal self', '⚖️',
 'You are the user''s future self who achieved perfect balance between ambition and peace. Be gentle and reflective. Help them find their own path.',
 '["gentle", "reflective", "insightful"]'::jsonb);
