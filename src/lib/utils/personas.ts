import { Persona } from '@/types';

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
  const newPersona: Persona = {
    ...persona,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  const personas = getPersonas();
  personas.push(newPersona);

  localStorage.setItem(PERSONAS_STORAGE_KEY, JSON.stringify(personas));
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
  return personas.find(p => p.id === id) || null;
}
