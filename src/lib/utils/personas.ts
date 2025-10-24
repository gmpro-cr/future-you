import { Persona } from '@/types';
import { generatePersonaAvatar, suggestAvatarStyle } from './avatarGenerator';

const PERSONAS_STORAGE_KEY = 'custom_personas';

export function getPersonas(): Persona[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(PERSONAS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading personas:', error);
    return [];
  }
}

export function savePersona(persona: Omit<Persona, 'id' | 'createdAt'>): Persona {
  // Auto-generate avatar if not provided (with emoji if available)
  const avatarUrl = persona.avatarUrl || generatePersonaAvatar(
    persona.name,
    suggestAvatarStyle(persona.name, persona.description || ''),
    persona.description || '',
    persona.emoji
  );

  const newPersona: Persona = {
    ...persona,
    avatarUrl,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  console.log('💾 Saving new persona:', {
    id: newPersona.id,
    name: newPersona.name,
    description: newPersona.description,
    avatarUrl: newPersona.avatarUrl,
    systemPromptLength: newPersona.systemPrompt.length,
    systemPromptPreview: newPersona.systemPrompt.substring(0, 100) + '...',
  });

  const personas = getPersonas();
  personas.push(newPersona);

  localStorage.setItem(PERSONAS_STORAGE_KEY, JSON.stringify(personas));

  console.log('✅ Persona saved successfully. Total personas:', personas.length);

  return newPersona;
}

export function updatePersona(id: string, updates: Partial<Omit<Persona, 'id' | 'createdAt'>>): Persona | null {
  const personas = getPersonas();
  const index = personas.findIndex(p => p.id === id);

  if (index === -1) return null;

  personas[index] = { ...personas[index], ...updates };
  localStorage.setItem(PERSONAS_STORAGE_KEY, JSON.stringify(personas));

  return personas[index];
}

export function deletePersona(id: string): boolean {
  const personas = getPersonas();
  const filtered = personas.filter(p => p.id !== id);

  if (filtered.length === personas.length) return false;

  localStorage.setItem(PERSONAS_STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

export function getPersonaById(id: string): Persona | null {
  const personas = getPersonas();
  const persona = personas.find(p => p.id === id) || null;

  if (persona) {
    console.log('📖 Retrieved persona:', {
      id: persona.id,
      name: persona.name,
      hasDescription: !!persona.description,
      hasSystemPrompt: !!persona.systemPrompt,
      systemPromptLength: persona.systemPrompt?.length || 0,
    });
  } else {
    console.warn('⚠️ Persona not found with ID:', id);
  }

  return persona;
}

/**
 * Migrate existing personas to add avatars if they don't have one
 * Also regenerates old Pravatar URLs (from i.pravatar.cc) with new avatar styles
 * This should be called when the app loads
 */
export function migratePersonasWithAvatars(): void {
  if (typeof window === 'undefined') return;

  const personas = getPersonas();
  let updated = false;

  const migratedPersonas = personas.map(persona => {
    // Check if persona needs avatar generation or regeneration
    const needsNewAvatar = !persona.avatarUrl ||
                           (persona.avatarUrl && persona.avatarUrl.includes('pravatar.cc'));

    if (needsNewAvatar) {
      const avatarUrl = generatePersonaAvatar(
        persona.name,
        suggestAvatarStyle(persona.name, persona.description || ''),
        persona.description || '',
        persona.emoji
      );

      console.log(`🎨 ${persona.avatarUrl ? 'Regenerating' : 'Adding'} avatar for persona: ${persona.name}`);
      updated = true;

      return {
        ...persona,
        avatarUrl
      };
    }
    return persona;
  });

  // Only update localStorage if changes were made
  if (updated) {
    localStorage.setItem(PERSONAS_STORAGE_KEY, JSON.stringify(migratedPersonas));
    console.log(`✅ Migrated ${personas.length} personas with new avatars`);
  }
}
