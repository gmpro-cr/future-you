import { Persona } from '@/types';

// Fetch all personas from API
export async function getPersonas(): Promise<Persona[]> {
  try {
    // Get session identifier from localStorage
    const authSession = typeof window !== 'undefined' ? localStorage.getItem('auth_session') : null;
    let sessionId = '';

    if (authSession) {
      try {
        const session = JSON.parse(authSession);
        sessionId = session.userId || '';
      } catch (e) {
        console.error('Failed to parse auth_session:', e);
      }
    }

    console.log('🔍 Fetching personas for session:', sessionId);

    const response = await fetch(`/api/personas?sessionId=${encodeURIComponent(sessionId)}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      console.log(`✅ Loaded ${result.data.personas.length} personas from API`);
      return result.data.personas;
    }

    console.error('Failed to fetch personas:', result.error);
    return [];
  } catch (error) {
    console.error('Error fetching personas:', error);
    return [];
  }
}

// Create new persona via API
export async function savePersona(persona: Omit<Persona, 'id' | 'createdAt'>): Promise<Persona | null> {
  try {
    // Get session identifier from localStorage
    const authSession = typeof window !== 'undefined' ? localStorage.getItem('auth_session') : null;
    let sessionId = '';

    if (authSession) {
      try {
        const session = JSON.parse(authSession);
        sessionId = session.userId || '';
      } catch (e) {
        console.error('Failed to parse auth_session:', e);
      }
    }

    console.log('📤 Sending persona creation request:', {
      name: persona.name,
      systemPromptLength: persona.systemPrompt?.length,
      description: persona.description,
      emoji: persona.emoji,
      sessionId,
    });

    const response = await fetch('/api/personas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: persona.name,
        systemPrompt: persona.systemPrompt,
        description: persona.description || '',
        emoji: persona.emoji,
        sessionId,  // Pass session ID for user privacy
      }),
      cache: 'no-store',
    });

    console.log('📥 Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to create persona:', response.status, errorText);
      throw new Error(`Failed to create persona: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Persona creation result:', result);

    if (result.success) {
      return result.data.persona;
    }

    console.error('❌ Failed to create persona:', result.error);
    throw new Error(result.error?.message || 'Failed to create persona');
  } catch (error) {
    console.error('💥 Error creating persona:', error);
    throw error; // Re-throw to let caller handle it
  }
}

// Update persona via API
export async function updatePersona(
  id: string,
  updates: Partial<Omit<Persona, 'id' | 'createdAt'>>
): Promise<Persona | null> {
  try {
    const response = await fetch(`/api/personas/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: updates.name,
        systemPrompt: updates.systemPrompt,
        description: updates.description,
        emoji: updates.emoji,
      }),
    });

    const result = await response.json();

    if (result.success) {
      return result.data.persona;
    }

    console.error('Failed to update persona:', result.error);
    return null;
  } catch (error) {
    console.error('Error updating persona:', error);
    return null;
  }
}

// Delete persona via API
export async function deletePersona(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/personas/${id}`, {
      method: 'DELETE',
    });

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error deleting persona:', error);
    return false;
  }
}

// Get persona by ID
export async function getPersonaById(id: string): Promise<Persona | null> {
  try {
    const personas = await getPersonas();
    return personas.find(p => p.id === id) || null;
  } catch (error) {
    console.error('Error getting persona by ID:', error);
    return null;
  }
}

// No longer needed - avatars disabled
export function migratePersonasWithAvatars(): void {
  return;
}
