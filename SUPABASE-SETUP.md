# 🗄️ Supabase Database Setup

## ✅ Your Credentials Are Configured

Your Supabase credentials have been added to `.env.local`:
- Project URL: `https://exdjsvknudvfkabnifrg.supabase.co`
- Anon Key: ✅ Configured
- Service Key: ✅ Configured

---

## 📋 Next Step: Run Database Schema

You need to run the SQL schema to create all the database tables.

### Option 1: Via Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**:
   - Open: https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg

2. **Open SQL Editor**:
   - Click **SQL Editor** in the left sidebar
   - Click **New Query**

3. **Copy the Schema**:
   - Open file: `future-you/src/lib/db/schema.sql`
   - Copy ALL contents (entire file)

4. **Paste and Run**:
   - Paste into the SQL Editor
   - Click **Run** (or press Ctrl+Enter)
   - Wait for success message

5. **Verify Tables Created**:
   - Click **Table Editor** in sidebar
   - You should see 5 tables:
     - ✅ sessions
     - ✅ personas (with 7 rows)
     - ✅ conversations
     - ✅ messages
     - ✅ feedback

---

### Option 2: Copy-Paste Quick Schema (If file is hard to find)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sessions Table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days',
  fingerprint TEXT NOT NULL UNIQUE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Personas Table
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

-- Indexes
CREATE INDEX idx_sessions_fingerprint ON sessions(fingerprint);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_conversations_session ON conversations(session_id);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_feedback_message ON feedback(message_id);

-- Triggers and Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON conversations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

-- RLS Policies
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow session operations" ON sessions FOR ALL USING (true);
CREATE POLICY "Allow conversation operations" ON conversations FOR ALL USING (true);
CREATE POLICY "Allow message operations" ON messages FOR ALL USING (true);

-- Seed 7 Personas
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
```

---

## ✅ After Running the Schema

Once you run the SQL:

1. **Check Table Editor**: You should see 5 tables
2. **Check Personas table**: Should have 7 rows (one for each persona)
3. **Your app will work!** 🎉

---

## 🚀 Test Your App

After setting up the database:

1. Go to: **http://localhost:3000**
2. Click "Start Your Journey"
3. Select "Entrepreneur" 🚀
4. Type a message: "Should I quit my job to start a business?"
5. **You should get an AI response from Gemini!**

---

## 🐛 Troubleshooting

### Error: "relation 'sessions' does not exist"
- ✅ **Solution**: Run the SQL schema in Supabase

### Error: "Invalid API key"
- ✅ **Solution**: Check that your Supabase project URL and keys match

### Error: "No rows in personas table"
- ✅ **Solution**: Make sure you ran the INSERT statements at the end of the schema

---

## 📊 What Each Table Does

| Table | Purpose |
|-------|---------|
| **sessions** | Stores browser fingerprints for anonymous users |
| **personas** | The 7 AI personas (Entrepreneur, Mindful, etc.) |
| **conversations** | Each chat session with a persona |
| **messages** | Individual messages in conversations |
| **feedback** | User ratings on AI responses (future feature) |

---

## 💡 Quick Tip

After running the schema, you can view your data in real-time:
- Go to **Table Editor** in Supabase
- Click any table to see the data
- Watch messages appear as you chat! 🎯

---

## 🧪 Verify Your Setup

After running the schema, test everything is working:

```bash
node verify-setup.js
```

This will check:
- ✅ Supabase connection
- ✅ All 7 personas are loaded
- ✅ All 5 tables exist
- ✅ Gemini API key is configured

If everything passes, you'll see: **🎉 Setup Complete!**

---

**Ready to chat with your future self!** 🚀
