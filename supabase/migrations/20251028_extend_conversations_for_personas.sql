-- Add persona support to conversations table
ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS session_id TEXT,
  ADD COLUMN IF NOT EXISTS persona_id UUID REFERENCES personas(id),
  ADD COLUMN IF NOT EXISTS is_guest_session BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS guest_message_count INTEGER DEFAULT 0;

-- Create index for persona lookups
CREATE INDEX IF NOT EXISTS idx_conversations_persona ON conversations(persona_id);

-- Create index for guest session queries
CREATE INDEX IF NOT EXISTS idx_conversations_guest_session ON conversations(session_id, is_guest_session);

COMMENT ON COLUMN conversations.session_id IS 'Session identifier for tracking guest and authenticated users';
COMMENT ON COLUMN conversations.persona_id IS 'Reference to the persona being chatted with';
COMMENT ON COLUMN conversations.is_guest_session IS 'Whether this is a guest (unauthenticated) session';
COMMENT ON COLUMN conversations.guest_message_count IS 'Number of messages sent by guest in this conversation';
