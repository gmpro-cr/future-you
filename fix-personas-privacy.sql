-- Quick Fix: Add session_identifier to personas for user filtering
-- This allows both guest users and Google users to have private personas

-- Add session_identifier column
ALTER TABLE personas
  ADD COLUMN IF NOT EXISTS session_identifier TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_personas_session_identifier
  ON personas(session_identifier);

-- Verify
SELECT 'Session identifier column added successfully' as status;
