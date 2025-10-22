-- Migration: Make persona_type nullable for custom persona support
-- This allows conversations to exist without predefined persona types

ALTER TABLE conversations
ALTER COLUMN persona_type DROP NOT NULL;

-- Update the column to have a default value of 'custom' for new rows
ALTER TABLE conversations
ALTER COLUMN persona_type SET DEFAULT 'custom';

-- Optional: Update existing rows that might have issues
UPDATE conversations
SET persona_type = 'custom'
WHERE persona_type IS NULL;
