-- Drop old table
DROP TABLE IF EXISTS personas CASCADE;

-- Create new table with full schema
CREATE TABLE IF NOT EXISTS personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,
  subcategory VARCHAR(50),
  avatar_url TEXT NOT NULL,
  cover_image_url TEXT,
  bio TEXT NOT NULL,
  short_description VARCHAR(255) NOT NULL,
  personality_traits JSONB NOT NULL DEFAULT '[]'::jsonb,
  system_prompt TEXT NOT NULL,
  conversation_starters TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  knowledge_areas TEXT[] DEFAULT ARRAY[]::TEXT[],
  language_capabilities TEXT[] DEFAULT ARRAY['en', 'hi', 'hinglish']::TEXT[],
  is_premium BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  rating_average DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  conversation_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_personas_category ON personas(category);
CREATE INDEX idx_personas_slug ON personas(slug);
CREATE INDEX idx_personas_active ON personas(is_active);
CREATE INDEX idx_personas_sort_order ON personas(sort_order);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_personas_updated_at BEFORE UPDATE ON personas
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active personas
CREATE POLICY "Allow public read access to active personas"
  ON personas FOR SELECT
  USING (is_active = TRUE);

-- Allow authenticated users to read all personas
CREATE POLICY "Allow authenticated read all personas"
  ON personas FOR SELECT
  TO authenticated
  USING (TRUE);

COMMENT ON TABLE personas IS 'Pre-built AI personas for conversations';
