import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database query functions

export async function createSession(fingerprint: string) {
  const { data, error } = await supabase
    .from('sessions')
    .insert({ fingerprint })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getOrCreateSession(fingerprint: string) {
  // Try to get existing session
  const { data: existingSession } = await supabase
    .from('sessions')
    .select('*')
    .eq('fingerprint', fingerprint)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (existingSession) {
    return existingSession;
  }

  // Create new session if not found or expired
  return createSession(fingerprint);
}

export async function createConversation(sessionId: string, personaId?: string) {
  const insertData = {
    session_id: sessionId,
    persona_type: 'custom', // Default value to satisfy NOT NULL constraint
    custom_persona_description: personaId ? `Custom persona: ${personaId}` : null,
  };

  console.log('Creating conversation with data:', insertData);

  const { data, error } = await supabase
    .from('conversations')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Supabase insert error:', error);
    throw error;
  }

  console.log('Conversation created successfully:', data);
  return data;
}

export async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  tokenCount?: number
) {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role,
      content,
      token_count: tokenCount,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getConversationHistory(conversationId: string, limit = 10) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []).reverse();
}

export async function getConversationsBySession(sessionId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('session_id', sessionId)
    .eq('is_active', true)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function saveFeedback(
  messageId: string,
  conversationId: string,
  sessionId: string,
  feedbackType: 'thumbs_up' | 'thumbs_down' | 'rating',
  rating?: number,
  comment?: string
) {
  const { data, error } = await supabase
    .from('feedback')
    .insert({
      message_id: messageId,
      conversation_id: conversationId,
      session_id: sessionId,
      feedback_type: feedbackType,
      rating,
      comment,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
