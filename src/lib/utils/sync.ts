import { getUserProfile } from './userProfile';
import { getPersonas } from './personas';

/**
 * Sync user profile to backend
 */
export async function syncUserProfile(): Promise<boolean> {
  try {
    const profile = getUserProfile();
    if (!profile) {
      console.log('No user profile to sync');
      return false;
    }

    const response = await fetch('/api/sync/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });

    if (!response.ok) {
      console.error('Failed to sync user profile:', await response.text());
      return false;
    }

    const data = await response.json();
    console.log('✅ User profile synced:', data.action);
    return true;
  } catch (error) {
    console.error('Error syncing user profile:', error);
    return false;
  }
}

/**
 * Sync all personas from localStorage to backend
 */
export async function syncPersonas(): Promise<boolean> {
  try {
    const personas = await getPersonas();
    if (personas.length === 0) {
      console.log('No personas to sync');
      return false;
    }

    const response = await fetch('/api/sync/personas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personas }),
    });

    if (!response.ok) {
      console.error('Failed to sync personas:', await response.text());
      return false;
    }

    const data = await response.json();
    console.log('✅ Personas synced:', data.results);
    return true;
  } catch (error) {
    console.error('Error syncing personas:', error);
    return false;
  }
}

/**
 * Load personas from backend and merge with localStorage
 */
export async function loadPersonasFromBackend(): Promise<any[]> {
  try {
    const response = await fetch('/api/sync/personas');

    if (!response.ok) {
      console.error('Failed to load personas:', await response.text());
      return [];
    }

    const data = await response.json();
    return data.personas || [];
  } catch (error) {
    console.error('Error loading personas:', error);
    return [];
  }
}

/**
 * Sync conversation for a specific persona
 */
export async function syncConversation(personaId: string, messages: any[]): Promise<boolean> {
  try {
    const response = await fetch('/api/sync/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personaId, messages }),
    });

    if (!response.ok) {
      console.error('Failed to sync conversation:', await response.text());
      return false;
    }

    console.log('✅ Conversation synced for persona:', personaId);
    return true;
  } catch (error) {
    console.error('Error syncing conversation:', error);
    return false;
  }
}

/**
 * Load conversation from backend for a specific persona
 */
export async function loadConversationFromBackend(personaId: string): Promise<any[] | null> {
  try {
    const response = await fetch(`/api/sync/conversations?personaId=${personaId}`);

    if (!response.ok) {
      console.error('Failed to load conversation:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.conversation?.messages || null;
  } catch (error) {
    console.error('Error loading conversation:', error);
    return null;
  }
}

/**
 * Delete persona from backend
 */
export async function deletePersonaFromBackend(personaId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/sync/personas?id=${personaId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      console.error('Failed to delete persona:', await response.text());
      return false;
    }

    console.log('✅ Persona deleted from backend:', personaId);
    return true;
  } catch (error) {
    console.error('Error deleting persona:', error);
    return false;
  }
}

/**
 * Complete sync - sync user profile, personas, and optionally conversations
 */
export async function performCompleteSync(syncConversations: boolean = false): Promise<{
  userSynced: boolean;
  personasSynced: boolean;
  conversationsSynced: number;
}> {
  console.log('🔄 Starting complete sync...');

  const result = {
    userSynced: false,
    personasSynced: false,
    conversationsSynced: 0,
  };

  // 1. Sync user profile
  result.userSynced = await syncUserProfile();

  // 2. Sync personas
  result.personasSynced = await syncPersonas();

  // 3. Optionally sync conversations
  if (syncConversations) {
    const personas = await getPersonas();
    for (const persona of personas) {
      const conversationKey = `conversation_${persona.id}`;
      const conversationData = localStorage.getItem(conversationKey);

      if (conversationData) {
        try {
          const messages = JSON.parse(conversationData);
          const synced = await syncConversation(persona.id, messages);
          if (synced) result.conversationsSynced++;
        } catch (error) {
          console.error(`Error syncing conversation for ${persona.id}:`, error);
        }
      }
    }
  }

  console.log('✅ Complete sync finished:', result);
  return result;
}

/**
 * Auto-sync - runs in the background periodically
 * Only syncs if user is authenticated (has session)
 */
export function startAutoSync(intervalMinutes: number = 5): NodeJS.Timeout {
  console.log(`🔄 Auto-sync enabled (every ${intervalMinutes} minutes)`);

  return setInterval(async () => {
    // Only sync if user profile exists (indicating they're logged in)
    const profile = getUserProfile();
    if (profile && profile.googleId) {
      await performCompleteSync(true);
    }
  }, intervalMinutes * 60 * 1000);
}
