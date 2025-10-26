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
  try {
    // First, get all public personas (celebrity personas)
    const { data: publicPersonas, error: publicError } = await supabase
      .from('personas')
      .select('*')
      .eq('is_active', true)
      .eq('is_public', true);

    if (publicError) {
      console.error('Error fetching public personas:', publicError);
    }

    // If we have a session identifier, also get user's private personas
    let userPersonas: any[] = [];
    if (sessionIdentifier) {
      // For now, just return public personas since we don't have direct user_id mapping
      // This logic can be enhanced later if needed
      userPersonas = [];
    }

    // Combine public and user personas, avoiding duplicates
    const allPersonas = [...(publicPersonas || []), ...userPersonas];
    
    // Remove duplicates based on ID
    const uniquePersonas = allPersonas.filter((persona, index, self) =>
      index === self.findIndex(p => p.id === persona.id)
    );

    return uniquePersonas.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (error) {
    console.error('Error in getAllPersonas:', error);
    return [];
  }
}

export async function createConversation(params: {
  session_id: string;
  persona_id?: string | null;
}) {
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      session_id: params.session_id,
      persona_id: params.persona_id || null,
      persona_type: 'custom', // Default type
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

// Alias for backward compatibility
export const saveMessage = addMessage;
export const getConversationHistory = getConversationMessages;
