-- Function to increment persona conversation count
CREATE OR REPLACE FUNCTION increment_persona_conversation_count(persona_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE personas
  SET conversation_count = conversation_count + 1
  WHERE id = persona_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
