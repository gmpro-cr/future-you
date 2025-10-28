export interface Persona {
  id: string;
  name: string;
  slug: string;
  category: PersonaCategory;
  subcategory?: string;
  avatar_url: string;
  cover_image_url?: string;
  bio: string;
  short_description: string;
  personality_traits: string[];
  system_prompt: string;
  conversation_starters: string[];
  tags: string[];
  knowledge_areas: string[];
  language_capabilities: string[];
  is_premium: boolean;
  is_active: boolean;
  sort_order: number;
  rating_average: number;
  rating_count: number;
  conversation_count: number;
  created_at: string;
  updated_at: string;
}

export type PersonaCategory =
  | 'business'
  | 'entertainment'
  | 'sports'
  | 'historical'
  | 'mythological'
  | 'creators';

export interface PersonaCardData {
  id: string;
  name: string;
  slug: string;
  category: PersonaCategory;
  avatar_url: string;
  short_description: string;
  tags: string[];
  conversation_count: number;
  is_premium: boolean;
}

export interface CreatePersonaInput {
  name: string;
  category: PersonaCategory;
  bio: string;
  short_description: string;
  personality_traits: string[];
  system_prompt: string;
  conversation_starters: string[];
  avatar_url: string;
  tags?: string[];
  knowledge_areas?: string[];
}
