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

  // Create new session if none exists or expired
  return createSession(fingerprint);
}

export async function createPersona(
  name: string,
  systemPrompt: string,
  description?: string,
  emoji?: string,
  sessionIdentifier?: string
) {
  const { data, error } = await supabase
    .from('personas')
    .insert({
      type: 'custom',
      name,
      description: description || '',
      system_prompt: systemPrompt,
      emoji,
      session_identifier: sessionIdentifier, // For user privacy
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePersonaById(
  id: string,
  updates: {
    name?: string;
    description?: string;
    system_prompt?: string;
    emoji?: string;
  }
) {
  const { data, error } = await supabase
    .from('personas')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePersonaById(id: string) {
  // Soft delete
  const { error } = await supabase
    .from('personas')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function getPersonaById(id: string, sessionIdentifier?: string) {
  const { data, error } = await supabase
    .from('personas')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error) throw error;
  return data;
}

export async function getAllPersonas(sessionIdentifier?: string) {
  let query = supabase
    .from('personas')
    .select('*')
    .eq('is_active', true);

  // Filter by session_identifier if provided (for user privacy)
  if (sessionIdentifier) {
    query = query.or(`is_public.eq.true,session_identifier.eq.${sessionIdentifier}`);
  } else {
    query = query.eq('is_public', true);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createConversation(
  sessionIdentifier: string,
  personaId: string
) {
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      session_identifier: sessionIdentifier,
      persona_id: personaId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getConversationById(id: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select(
      `
      *,
      persona:personas(*)
    `
    )
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getConversationsBySession(sessionIdentifier: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select(
      `
      *,
      persona:personas(*)
    `
    )
    .eq('session_identifier', sessionIdentifier)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getConversationMessages(conversationId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function addMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string
) {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role,
      content,
    })
    .select()
    .single();

  if (error) throw error;

  // Update conversation's updated_at timestamp
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  return data;
}
