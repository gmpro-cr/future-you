import { supabase } from './supabase';
import { Persona, PersonaCategory, CreatePersonaInput } from '@/types/persona';

/**
 * Get all personas with optional filtering
 *
 * @param category - Optional category filter
 * @param search - Optional search query (searches name, short_description, and tags)
 * @param tagsFilter - Optional array of tags to filter by
 * @returns Array of personas matching the filters
 * @throws Error if the database query fails
 */
export async function getAllPersonas(
  category?: PersonaCategory,
  search?: string,
  tagsFilter?: string[]
): Promise<Persona[]> {
  let query = supabase
    .from('personas')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (category) {
    query = query.eq('category', category);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,short_description.ilike.%${search}%,tags.cs.{${search}}`);
  }

  if (tagsFilter && tagsFilter.length > 0) {
    query = query.contains('tags', tagsFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching personas:', error);
    throw new Error(`Failed to fetch personas: ${error.message}`);
  }

  return data || [];
}

/**
 * Get single persona by slug
 *
 * @param slug - The unique slug identifier for the persona
 * @returns Persona object if found, null otherwise
 * @throws Error if the database query fails (excluding not found errors)
 */
export async function getPersonaBySlug(slug: string): Promise<Persona | null> {
  const { data, error } = await supabase
    .from('personas')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching persona:', error);
    throw new Error(`Failed to fetch persona: ${error.message}`);
  }

  return data;
}

/**
 * Get persona by ID
 *
 * @param id - The UUID of the persona
 * @returns Persona object if found, null otherwise
 * @throws Error if the database query fails (excluding not found errors)
 */
export async function getPersonaById(id: string): Promise<Persona | null> {
  const { data, error } = await supabase
    .from('personas')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching persona:', error);
    throw new Error(`Failed to fetch persona: ${error.message}`);
  }

  return data;
}

/**
 * Get categories with persona counts
 *
 * @returns Array of objects containing category names and their persona counts
 * @throws Error if the database query fails
 */
export async function getPersonaCategories(): Promise<Array<{ category: PersonaCategory; count: number }>> {
  const { data, error } = await supabase
    .from('personas')
    .select('category')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching categories:', error);
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  // Count by category
  const counts = (data || []).reduce((acc, { category }) => {
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(counts).map(([category, count]) => ({
    category: category as PersonaCategory,
    count
  }));
}

/**
 * Increment conversation count for persona
 *
 * This function calls a database function to atomically increment the conversation count.
 * It's non-critical and won't throw errors - failures are logged but don't interrupt the flow.
 *
 * @param personaId - The UUID of the persona to increment
 */
export async function incrementPersonaConversationCount(personaId: string): Promise<void> {
  const { error } = await supabase.rpc('increment_persona_conversation_count', {
    persona_id: personaId
  });

  if (error) {
    console.error('Error incrementing conversation count:', error);
    // Non-critical, don't throw
  }
}

/**
 * Create new persona (admin only)
 *
 * Generates a slug from the persona name and creates a new persona record.
 * Only name and system_prompt are required - all other fields have sensible defaults.
 *
 * @param input - Persona creation data (only name and system_prompt required)
 * @returns The created Persona object
 * @throws Error if the database insert fails
 */
export async function createPersonaRecord(input: CreatePersonaInput): Promise<Persona> {
  // Generate slug from name
  const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  // Generate UI Avatar URL as default
  const generateAvatarUrl = (name: string) => {
    const encodedName = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${encodedName}&size=400&background=4F46E5&color=fff&bold=true&format=png`;
  };

  // Provide sensible defaults for all optional fields
  const personaData = {
    name: input.name,
    slug,
    category: input.category || 'creators' as PersonaCategory,
    bio: input.bio || input.system_prompt, // Use system prompt as bio if not provided
    short_description: input.short_description || `Chat with ${input.name}`,
    personality_traits: input.personality_traits || ['Helpful', 'Friendly', 'Knowledgeable'],
    system_prompt: input.system_prompt,
    conversation_starters: input.conversation_starters || [
      `Tell me about yourself`,
      `What can you help me with?`,
      `What's your area of expertise?`
    ],
    avatar_url: input.avatar_url || generateAvatarUrl(input.name),
    tags: input.tags || [],
    knowledge_areas: input.knowledge_areas || []
  };

  const { data, error } = await supabase
    .from('personas')
    .insert(personaData)
    .select()
    .single();

  if (error) {
    console.error('Error creating persona:', error);
    throw new Error(`Failed to create persona: ${error.message}`);
  }

  return data;
}

/**
 * Update persona (admin only)
 *
 * Updates an existing persona with the provided fields.
 * Only the fields present in the updates object will be modified.
 *
 * @param id - The UUID of the persona to update
 * @param updates - Partial Persona object with fields to update
 * @returns The updated Persona object
 * @throws Error if the database update fails
 */
export async function updatePersonaRecord(id: string, updates: Partial<Persona>): Promise<Persona> {
  const { data, error } = await supabase
    .from('personas')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating persona:', error);
    throw new Error(`Failed to update persona: ${error.message}`);
  }

  return data;
}
