# Esperit Persona Platform - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Esperit from "Future Self" concept to persona-based conversational AI platform with 45-50 curated personas, guest mode, and admin UI - delivered in one week.

**Architecture:** Page-by-page replacement strategy preserving existing Next.js + Supabase + Gemini infrastructure. Evolve existing conversation schema, add new personas tables, build persona-aware chat layer, implement guest session tracking with 10-message limit.

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Supabase (PostgreSQL + Auth), Google Gemini API, Framer Motion

---

## Sprint Overview: 7 Days, No Compromises

**Day 1-2:** Database schema + API foundation + Core components
**Day 3-4:** Pages transformation + Gemini integration + Guest mode
**Day 5-6:** Admin UI + Persona seeding + Testing
**Day 7:** Polish + Deployment + Documentation

---

## DAY 1: Database Foundation & API Layer

### Task 1: Database Schema Migration - Personas Table

**Files:**
- Create: `supabase/migrations/20251028_create_personas_table.sql`
- Create: `src/types/persona.ts`

**Step 1: Write personas table migration**

Create `supabase/migrations/20251028_create_personas_table.sql`:

```sql
-- Create personas table
CREATE TABLE IF NOT EXISTS personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,
  subcategory VARCHAR(50),
  avatar_url TEXT NOT NULL,
  cover_image_url TEXT,
  bio TEXT NOT NULL,
  short_description VARCHAR(255) NOT NULL,
  personality_traits JSONB NOT NULL DEFAULT '[]'::jsonb,
  system_prompt TEXT NOT NULL,
  conversation_starters TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  knowledge_areas TEXT[] DEFAULT ARRAY[]::TEXT[],
  language_capabilities TEXT[] DEFAULT ARRAY['en', 'hi', 'hinglish']::TEXT[],
  is_premium BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  rating_average DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  conversation_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_personas_category ON personas(category);
CREATE INDEX idx_personas_slug ON personas(slug);
CREATE INDEX idx_personas_active ON personas(is_active);
CREATE INDEX idx_personas_sort_order ON personas(sort_order);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_personas_updated_at BEFORE UPDATE ON personas
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active personas
CREATE POLICY "Allow public read access to active personas"
  ON personas FOR SELECT
  USING (is_active = TRUE);

-- Allow authenticated users to read all personas
CREATE POLICY "Allow authenticated read all personas"
  ON personas FOR SELECT
  TO authenticated
  USING (TRUE);

COMMENT ON TABLE personas IS 'Pre-built AI personas for conversations';
```

**Step 2: Run migration on Supabase**

1. Go to Supabase Dashboard → SQL Editor
2. Paste the migration SQL
3. Click "Run"
4. Verify: Check Tables section for `personas` table

Expected: Table created with all columns and indexes

**Step 3: Create TypeScript types**

Create `src/types/persona.ts`:

```typescript
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
```

**Step 4: Commit**

```bash
git add supabase/migrations/20251028_create_personas_table.sql src/types/persona.ts
git commit -m "feat: add personas table schema and TypeScript types

- Create personas table with full schema
- Add indexes for category, slug, active status
- Add RLS policies for public/authenticated access
- Define TypeScript interfaces for type safety"
```

---

### Task 2: Extend Conversations Schema for Personas

**Files:**
- Create: `supabase/migrations/20251028_extend_conversations_for_personas.sql`
- Modify: `src/types/conversation.ts`

**Step 1: Write conversations extension migration**

Create `supabase/migrations/20251028_extend_conversations_for_personas.sql`:

```sql
-- Add persona support to conversations table
ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS persona_id UUID REFERENCES personas(id),
  ADD COLUMN IF NOT EXISTS is_guest_session BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS guest_message_count INTEGER DEFAULT 0;

-- Create index for persona lookups
CREATE INDEX IF NOT EXISTS idx_conversations_persona ON conversations(persona_id);

-- Create index for guest session queries
CREATE INDEX IF NOT EXISTS idx_conversations_guest_session ON conversations(session_id, is_guest_session);

COMMENT ON COLUMN conversations.persona_id IS 'Reference to the persona being chatted with';
COMMENT ON COLUMN conversations.is_guest_session IS 'Whether this is a guest (unauthenticated) session';
COMMENT ON COLUMN conversations.guest_message_count IS 'Number of messages sent by guest in this conversation';
```

**Step 2: Run migration on Supabase**

1. Go to Supabase Dashboard → SQL Editor
2. Paste the migration SQL
3. Click "Run"
4. Verify: Check `conversations` table schema for new columns

Expected: Three new columns added with indexes

**Step 3: Update conversation types**

Modify `src/types/conversation.ts` (add to existing interface):

```typescript
export interface Conversation {
  id: string;
  user_id?: string;
  session_id: string;
  persona_id?: string;  // NEW
  is_guest_session: boolean;  // NEW
  guest_message_count: number;  // NEW
  created_at: string;
  updated_at: string;
}

export interface GuestSessionStatus {
  isGuest: boolean;
  messageCount: number;
  remainingMessages: number;
  conversationIds: string[];
}
```

**Step 4: Commit**

```bash
git add supabase/migrations/20251028_extend_conversations_for_personas.sql src/types/conversation.ts
git commit -m "feat: extend conversations schema for persona support

- Add persona_id foreign key to conversations
- Add guest session tracking fields
- Create indexes for efficient queries
- Update TypeScript types"
```

---

### Task 3: Persona API - Supabase Client Functions

**Files:**
- Modify: `src/lib/api/supabase.ts` (add new functions)

**Step 1: Add persona query functions**

Add to `src/lib/api/supabase.ts`:

```typescript
import { Persona, PersonaCategory, CreatePersonaInput } from '@/types/persona';

/**
 * Get all personas with optional filtering
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
 */
export async function createPersonaRecord(input: CreatePersonaInput): Promise<Persona> {
  // Generate slug from name
  const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const { data, error } = await supabase
    .from('personas')
    .insert({
      name: input.name,
      slug,
      category: input.category,
      bio: input.bio,
      short_description: input.short_description,
      personality_traits: input.personality_traits,
      system_prompt: input.system_prompt,
      conversation_starters: input.conversation_starters,
      avatar_url: input.avatar_url,
      tags: input.tags || [],
      knowledge_areas: input.knowledge_areas || []
    })
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
```

**Step 2: Add database function for conversation count**

Create `supabase/migrations/20251028_add_persona_functions.sql`:

```sql
-- Function to increment persona conversation count
CREATE OR REPLACE FUNCTION increment_persona_conversation_count(persona_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE personas
  SET conversation_count = conversation_count + 1
  WHERE id = persona_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Run this migration in Supabase Dashboard.

**Step 3: Commit**

```bash
git add src/lib/api/supabase.ts supabase/migrations/20251028_add_persona_functions.sql
git commit -m "feat: add persona API client functions

- getAllPersonas with filtering support
- getPersonaBySlug for individual lookups
- getPersonaCategories for category listing
- incrementPersonaConversationCount helper
- Admin CRUD functions for persona management"
```

---

### Task 4: Persona API Routes

**Files:**
- Modify: `src/app/api/personas/route.ts` (already exists, refactor)
- Create: `src/app/api/personas/[slug]/route.ts`

**Step 1: Refactor main personas route**

Replace content of `src/app/api/personas/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getAllPersonas, getPersonaCategories, createPersonaRecord } from '@/lib/api/supabase';
import { PersonaCategory } from '@/types/persona';

export const dynamic = 'force-dynamic';

/**
 * GET /api/personas - List all personas with filtering
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get('category') as PersonaCategory | null;
    const search = searchParams.get('search');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);

    console.log('📥 GET /api/personas', { category, search, tags });

    const [personas, categories] = await Promise.all([
      getAllPersonas(category || undefined, search || undefined, tags),
      getPersonaCategories()
    ]);

    console.log(`✅ Returning ${personas.length} personas`);

    return NextResponse.json({
      success: true,
      data: {
        personas,
        categories,
        total: personas.length
      }
    });
  } catch (error: any) {
    console.error('❌ Error fetching personas:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error.message || 'Failed to fetch personas'
        }
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/personas - Create new persona (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    // TODO: Add admin authentication check
    const body = await req.json();

    console.log('📝 POST /api/personas', { name: body.name, category: body.category });

    const persona = await createPersonaRecord(body);

    console.log('✅ Persona created:', persona.id);

    return NextResponse.json({
      success: true,
      data: { persona }
    });
  } catch (error: any) {
    console.error('❌ Error creating persona:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: error.message || 'Failed to create persona'
        }
      },
      { status: 500 }
    );
  }
}
```

**Step 2: Create persona detail route**

Create `src/app/api/personas/[slug]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getPersonaBySlug } from '@/lib/api/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/personas/[slug] - Get single persona by slug
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    console.log('📥 GET /api/personas/[slug]', { slug });

    const persona = await getPersonaBySlug(slug);

    if (!persona) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Persona not found'
          }
        },
        { status: 404 }
      );
    }

    console.log('✅ Persona found:', persona.name);

    return NextResponse.json({
      success: true,
      data: { persona }
    });
  } catch (error: any) {
    console.error('❌ Error fetching persona:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error.message || 'Failed to fetch persona'
        }
      },
      { status: 500 }
    );
  }
}
```

**Step 3: Test API endpoints**

Run dev server: `npm run dev`

Test GET all: `curl http://localhost:3000/api/personas`
Expected: `{"success":true,"data":{"personas":[],"categories":[],"total":0}}`

Test GET by slug: `curl http://localhost:3000/api/personas/test-persona`
Expected: `{"success":false,"error":{"code":"NOT_FOUND",...}}`

**Step 4: Commit**

```bash
git add src/app/api/personas/route.ts src/app/api/personas/[slug]/route.ts
git commit -m "feat: implement persona API routes

- GET /api/personas with category/search/tags filtering
- GET /api/personas/[slug] for individual persona
- POST /api/personas for admin creation
- Return categories with persona counts
- Add force-dynamic for proper SSR"
```

---

## DAY 2: Core Components & Guest Mode

### Task 5: Guest Mode Utilities

**Files:**
- Create: `src/lib/utils/guestMode.ts`
- Create: `src/app/api/guest/status/route.ts`

**Step 1: Write guest mode utilities**

Create `src/lib/utils/guestMode.ts`:

```typescript
import { supabase } from '@/lib/api/supabase';
import { GuestSessionStatus } from '@/types/conversation';

const GUEST_MESSAGE_LIMIT = 10;

/**
 * Check if session is guest and get message count
 */
export async function checkGuestStatus(sessionId: string): Promise<GuestSessionStatus> {
  // Check if authenticated
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    return {
      isGuest: false,
      messageCount: 0,
      remainingMessages: Infinity,
      conversationIds: []
    };
  }

  // Count guest messages across all conversations for this session
  const { data: conversations, error } = await supabase
    .from('conversations')
    .select('id, guest_message_count')
    .eq('session_id', sessionId)
    .eq('is_guest_session', true);

  if (error) {
    console.error('Error checking guest status:', error);
    throw new Error('Failed to check guest status');
  }

  const messageCount = (conversations || []).reduce(
    (sum, conv) => sum + (conv.guest_message_count || 0),
    0
  );

  return {
    isGuest: true,
    messageCount,
    remainingMessages: Math.max(0, GUEST_MESSAGE_LIMIT - messageCount),
    conversationIds: (conversations || []).map(c => c.id)
  };
}

/**
 * Increment guest message count for conversation
 */
export async function incrementGuestMessageCount(conversationId: string): Promise<number> {
  const { data, error } = await supabase
    .from('conversations')
    .select('guest_message_count')
    .eq('id', conversationId)
    .single();

  if (error) {
    console.error('Error fetching conversation:', error);
    throw new Error('Failed to increment message count');
  }

  const newCount = (data?.guest_message_count || 0) + 1;

  const { error: updateError } = await supabase
    .from('conversations')
    .update({ guest_message_count: newCount })
    .eq('id', conversationId);

  if (updateError) {
    console.error('Error updating message count:', updateError);
    throw new Error('Failed to update message count');
  }

  return newCount;
}

/**
 * Migrate guest conversations to authenticated user
 */
export async function migrateGuestConversations(
  guestSessionId: string,
  userId: string
): Promise<number> {
  const { data: guestConversations, error: fetchError } = await supabase
    .from('conversations')
    .select('id')
    .eq('session_id', guestSessionId)
    .eq('is_guest_session', true);

  if (fetchError) {
    console.error('Error fetching guest conversations:', fetchError);
    throw new Error('Failed to migrate conversations');
  }

  if (!guestConversations || guestConversations.length === 0) {
    return 0;
  }

  const { error: updateError } = await supabase
    .from('conversations')
    .update({
      user_id: userId,
      is_guest_session: false
    })
    .eq('session_id', guestSessionId)
    .eq('is_guest_session', true);

  if (updateError) {
    console.error('Error migrating conversations:', updateError);
    throw new Error('Failed to migrate conversations');
  }

  console.log(`✅ Migrated ${guestConversations.length} conversations to user ${userId}`);

  return guestConversations.length;
}

/**
 * Check if guest has reached message limit
 */
export function hasReachedGuestLimit(messageCount: number): boolean {
  return messageCount >= GUEST_MESSAGE_LIMIT;
}
```

**Step 2: Create guest status API route**

Create `src/app/api/guest/status/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { checkGuestStatus } from '@/lib/utils/guestMode';

export const dynamic = 'force-dynamic';

/**
 * GET /api/guest/status - Check guest session status
 */
export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_SESSION_ID',
            message: 'Session ID is required'
          }
        },
        { status: 400 }
      );
    }

    const status = await checkGuestStatus(sessionId);

    return NextResponse.json({
      success: true,
      data: status
    });
  } catch (error: any) {
    console.error('Error checking guest status:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'STATUS_CHECK_ERROR',
          message: error.message || 'Failed to check guest status'
        }
      },
      { status: 500 }
    );
  }
}
```

**Step 3: Commit**

```bash
git add src/lib/utils/guestMode.ts src/app/api/guest/status/route.ts
git commit -m "feat: implement guest mode session tracking

- checkGuestStatus for 10-message limit enforcement
- incrementGuestMessageCount for tracking
- migrateGuestConversations for signup conversion
- GET /api/guest/status endpoint"
```

---

### Task 6: Persona Components - PersonaCard

**Files:**
- Create: `src/components/personas/PersonaCard.tsx`

**Step 1: Create PersonaCard component**

Create `src/components/personas/PersonaCard.tsx`:

```typescript
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'link';
import { PersonaCardData } from '@/types/persona';
import { MessageCircle, Crown } from 'lucide-react';

interface PersonaCardProps {
  persona: PersonaCardData;
}

export function PersonaCard({ persona }: PersonaCardProps) {
  return (
    <Link href={`/chat/${persona.slug}`}>
      <motion.div
        className="group relative backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Premium Badge */}
        {persona.is_premium && (
          <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full px-3 py-1 flex items-center gap-1">
            <Crown className="w-3 h-3 text-white" />
            <span className="text-xs font-semibold text-white">Premium</span>
          </div>
        )}

        {/* Avatar */}
        <div className="aspect-square relative bg-gradient-to-br from-white/5 to-white/10">
          <Image
            src={persona.avatar_url}
            alt={persona.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-white/90 transition-colors">
            {persona.name}
          </h3>

          <p className="text-sm text-white/60 mb-3 line-clamp-2">
            {persona.short_description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {persona.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 bg-white/10 text-white/80 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2 text-xs text-white/50">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{persona.conversation_count.toLocaleString()} chats</span>
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </motion.div>
    </Link>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/personas/PersonaCard.tsx
git commit -m "feat: create PersonaCard component

- Display persona avatar, name, description
- Show premium badge for premium personas
- Display tags and conversation count
- Hover animations with Framer Motion
- Link to chat page"
```

---

### Task 7: Persona Components - PersonaGrid & Filters

**Files:**
- Create: `src/components/personas/PersonaGrid.tsx`
- Create: `src/components/personas/CategoryFilter.tsx`

**Step 1: Create PersonaGrid component**

Create `src/components/personas/PersonaGrid.tsx`:

```typescript
'use client';

import { PersonaCard } from './PersonaCard';
import { PersonaCardData } from '@/types/persona';

interface PersonaGridProps {
  personas: PersonaCardData[];
  loading?: boolean;
}

export function PersonaGrid({ personas, loading }: PersonaGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (personas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-6xl mb-4">🤔</div>
        <h3 className="text-xl font-semibold text-white mb-2">No personas found</h3>
        <p className="text-white/60">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {personas.map((persona) => (
        <PersonaCard key={persona.id} persona={persona} />
      ))}
    </div>
  );
}
```

**Step 2: Create CategoryFilter component**

Create `src/components/personas/CategoryFilter.tsx`:

```typescript
'use client';

import { PersonaCategory } from '@/types/persona';
import { motion } from 'framer-motion';

interface CategoryFilterProps {
  categories: Array<{ category: PersonaCategory; count: number }>;
  selected: PersonaCategory | 'all';
  onChange: (category: PersonaCategory | 'all') => void;
}

const CATEGORY_LABELS: Record<PersonaCategory | 'all', string> = {
  all: 'All',
  business: 'Business',
  entertainment: 'Entertainment',
  sports: 'Sports',
  historical: 'Historical',
  mythological: 'Mythological',
  creators: 'Creators'
};

const CATEGORY_EMOJIS: Record<PersonaCategory | 'all', string> = {
  all: '✨',
  business: '💼',
  entertainment: '🎬',
  sports: '⚽',
  historical: '📜',
  mythological: '🕉️',
  creators: '📱'
};

export function CategoryFilter({ categories, selected, onChange }: CategoryFilterProps) {
  const allCount = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {/* All tab */}
      <CategoryTab
        label="All"
        emoji="✨"
        count={allCount}
        active={selected === 'all'}
        onClick={() => onChange('all')}
      />

      {/* Category tabs */}
      {categories.map(({ category, count }) => (
        <CategoryTab
          key={category}
          label={CATEGORY_LABELS[category]}
          emoji={CATEGORY_EMOJIS[category]}
          count={count}
          active={selected === category}
          onClick={() => onChange(category)}
        />
      ))}
    </div>
  );
}

interface CategoryTabProps {
  label: string;
  emoji: string;
  count: number;
  active: boolean;
  onClick: () => void;
}

function CategoryTab({ label, emoji, count, active, onClick }: CategoryTabProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`
        relative flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-colors
        ${active
          ? 'bg-white text-black'
          : 'bg-white/5 text-white/80 hover:bg-white/10 hover:text-white border border-white/10'
        }
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span>{emoji}</span>
      <span>{label}</span>
      <span className={`text-xs ${active ? 'text-black/60' : 'text-white/50'}`}>
        ({count})
      </span>

      {active && (
        <motion.div
          layoutId="activeCategory"
          className="absolute inset-0 bg-white rounded-xl -z-10"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        />
      )}
    </motion.button>
  );
}
```

**Step 3: Commit**

```bash
git add src/components/personas/PersonaGrid.tsx src/components/personas/CategoryFilter.tsx
git commit -m "feat: add PersonaGrid and CategoryFilter components

- PersonaGrid with loading and empty states
- CategoryFilter with animated tab switching
- Category emojis and counts display
- Responsive grid layout"
```

---

## DAY 3: Pages Transformation

### Task 8: Personas Library Page

**Files:**
- Create: `src/app/personas/page.tsx`

**Step 1: Create personas page**

Create `src/app/personas/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { DarkLayout } from '@/components/layouts/DarkLayout';
import { PersonaGrid } from '@/components/personas/PersonaGrid';
import { CategoryFilter } from '@/components/personas/CategoryFilter';
import { PersonaCardData, PersonaCategory } from '@/types/persona';
import { Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function PersonasPage() {
  const [personas, setPersonas] = useState<PersonaCardData[]>([]);
  const [categories, setCategories] = useState<Array<{ category: PersonaCategory; count: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<PersonaCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPersonas();
  }, [selectedCategory]);

  async function fetchPersonas() {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/personas?${params}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to fetch personas');
      }

      setPersonas(result.data.personas);
      setCategories(result.data.categories);
    } catch (error: any) {
      console.error('Error fetching personas:', error);
      toast.error(error.message || 'Failed to load personas');
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchPersonas();
  }

  return (
    <DarkLayout particleCount={40}>
      <div className="min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/60 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-white" />
                <h1 className="text-2xl font-bold text-white">Esperit</h1>
              </div>

              <Link href="/profile" className="text-white/80 hover:text-white transition-colors">
                <User className="w-6 h-6" />
              </Link>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  placeholder="Search personas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-white/20 outline-none transition-colors"
                />
              </div>
            </form>

            {/* Category Filter */}
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onChange={setSelectedCategory}
            />
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PersonaGrid personas={personas} loading={loading} />
        </main>
      </div>
    </DarkLayout>
  );
}
```

**Step 2: Test personas page**

1. Run dev server: `npm run dev`
2. Navigate to `http://localhost:3000/personas`
3. Expected: Empty state (no personas yet)
4. Verify: Loading skeletons appear briefly
5. Verify: Category filter shows "All (0)"

**Step 3: Commit**

```bash
git add src/app/personas/page.tsx
git commit -m "feat: create personas library page

- Search functionality
- Category filtering
- Responsive grid layout
- Loading states
- Empty state handling
- Sticky header with navigation"
```

---

### Task 9: Update Home Page

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Update landing page content**

Replace the hero section in `src/app/page.tsx`:

```typescript
// Find and replace the hero h1 and description
<motion.h1
  className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
>
  Chat with India's Icons
</motion.h1>

<motion.p
  className="text-xl text-white/70 mb-12 max-w-2xl mx-auto"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, delay: 0.2 }}
>
  Connect with AI personas of business leaders, celebrities, historical figures, and spiritual guides. Learn, grow, and be inspired.
</motion.p>
```

**Step 2: Update redirect after login**

Find the `handleGoogleSignIn` function and update the callback URL:

```typescript
const handleGoogleSignIn = async () => {
  try {
    // Redirect to personas page after Google sign-in
    await signIn('google', { callbackUrl: '/personas' });
  } catch (error) {
    console.error('Sign in error:', error);
  }
};

const handleGuestContinue = () => {
  // Create a guest session without requiring details
  const userId = `guest_${Date.now()}`;
  createUserSession(userId, 'Guest');
  router.push('/personas');  // Changed from '/personas'
};
```

**Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: update home page for persona platform

- Change hero to 'Chat with India's Icons'
- Update value proposition messaging
- Redirect auth flow to /personas page
- Update guest mode redirect"
```

---

## DAY 4: Chat Integration

### Task 10: Enhanced Chat API with Persona Context

**Files:**
- Modify: `src/app/api/chat/route.ts`
- Create: `src/lib/utils/prompts.ts`

**Step 1: Create system prompt builder**

Create `src/lib/utils/prompts.ts`:

```typescript
import { Persona } from '@/types/persona';

/**
 * Build system prompt for Gemini based on persona characteristics
 */
export function buildSystemPrompt(persona: Persona): string {
  const personalityTraits = persona.personality_traits.join(', ');
  const knowledgeAreas = persona.knowledge_areas.join(', ');

  return `You are ${persona.name}, ${persona.short_description}.

BIOGRAPHY:
${persona.bio}

PERSONALITY TRAITS:
${personalityTraits}

COMMUNICATION STYLE:
- Use Hinglish naturally when appropriate (mixing Hindi and English)
- Reference your real experiences and known philosophy
- Maintain authenticity to your public persona and historical record
- Be warm, relatable, and culturally aware of Indian context
- Use examples and analogies relevant to Indian culture

KNOWLEDGE AREAS:
${knowledgeAreas}

RESPONSE GUIDELINES:
1. Stay in character consistently throughout the conversation
2. Draw from your known history, achievements, and public statements
3. Be inspiring yet humble - balance confidence with accessibility
4. Use culturally relevant examples from Indian society and traditions
5. Code-switch between English and Hindi naturally, as an educated Indian would
6. Reference Indian festivals, traditions, and social context when relevant
7. If asked about topics outside your expertise, acknowledge limitations gracefully
8. Maintain appropriate formality based on your persona (e.g., Ratan Tata: formal but warm)

LANGUAGE NOTES:
- When using Hindi words/phrases, use them naturally without translation if context is clear
- Common Hinglish patterns: "Yaar", "Bas", "Acha", "Theek hai", "Kya baat hai"
- Use Hindi for emotional emphasis: "Bahut important hai", "Sacchi mein"

Remember: You are speaking with someone seeking guidance, entertainment, or inspiration. Be the best, most authentic version of ${persona.name} that you can be. Your goal is to provide value through your unique perspective and experiences while being approachable and relatable.`;
}
```

**Step 2: Refactor chat API route**

Modify `src/app/api/chat/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getPersonaById, getConversationMessages, saveMessage } from '@/lib/api/supabase';
import { checkGuestStatus, incrementGuestMessageCount, hasReachedGuestLimit } from '@/lib/utils/guestMode';
import { buildSystemPrompt } from '@/lib/utils/prompts';

export const dynamic = 'force-dynamic';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { message, conversationId, personaId, sessionId } = await req.json();

    console.log('📥 POST /api/chat', { personaId, conversationId, sessionId });

    // Validate inputs
    if (!message || !personaId || !sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Message, persona ID, and session ID are required'
          }
        },
        { status: 400 }
      );
    }

    // Check guest limits
    const guestStatus = await checkGuestStatus(sessionId);

    if (guestStatus.isGuest && hasReachedGuestLimit(guestStatus.messageCount)) {
      console.log('❌ Guest limit reached:', guestStatus.messageCount);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'GUEST_LIMIT_REACHED',
            message: 'Sign up to continue chatting',
            requiresAuth: true
          }
        },
        { status: 403 }
      );
    }

    // Fetch persona
    const persona = await getPersonaById(personaId);

    if (!persona) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PERSONA_NOT_FOUND',
            message: 'Persona not found'
          }
        },
        { status: 404 }
      );
    }

    // Fetch conversation history
    const messages = conversationId
      ? await getConversationMessages(conversationId)
      : [];

    // Build system instruction
    const systemInstruction = buildSystemPrompt(persona);

    // Call Gemini API
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: {
        role: 'system',
        parts: [{ text: systemInstruction }]
      }
    });

    const chat = model.startChat({
      history: messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })),
      generationConfig: {
        temperature: 0.8,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 500,
      },
    });

    const result = await chat.sendMessage(message);
    const response = result.response;
    const responseText = response.text();

    console.log('✅ Gemini response received:', responseText.substring(0, 100) + '...');

    // Save messages
    const savedConversationId = await saveMessage({
      conversationId,
      sessionId,
      personaId,
      userMessage: message,
      assistantMessage: responseText,
      isGuestSession: guestStatus.isGuest
    });

    // Increment guest message count if guest
    let updatedMessageCount = guestStatus.messageCount;
    if (guestStatus.isGuest && savedConversationId) {
      updatedMessageCount = await incrementGuestMessageCount(savedConversationId);
    }

    return NextResponse.json({
      success: true,
      data: {
        message: responseText,
        conversationId: savedConversationId,
        guestLimit: guestStatus.isGuest ? {
          current: updatedMessageCount,
          max: 10,
          remainingMessages: Math.max(0, 10 - updatedMessageCount)
        } : null
      }
    });

  } catch (error: any) {
    console.error('❌ Chat error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CHAT_ERROR',
          message: error.message || 'Failed to process chat message'
        }
      },
      { status: 500 }
    );
  }
}
```

**Step 3: Commit**

```bash
git add src/lib/utils/prompts.ts src/app/api/chat/route.ts
git commit -m "feat: integrate persona context into chat API

- Build system prompts from persona characteristics
- Add Hinglish and cultural awareness instructions
- Pass persona context to Gemini API
- Enforce guest message limits
- Return guest status with responses"
```

---

---

## DAY 5: Admin UI & Data Preparation

### Task 11: Admin Persona Form Component

**Files:**
- Create: `src/components/admin/PersonaForm.tsx`

**Step 1: Create persona form component**

Create `src/components/admin/PersonaForm.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { PersonaCategory, CreatePersonaInput } from '@/types/persona';
import { toast } from 'sonner';

interface PersonaFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PersonaForm({ onSuccess, onCancel }: PersonaFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreatePersonaInput>({
    name: '',
    category: 'business',
    bio: '',
    short_description: '',
    personality_traits: [],
    system_prompt: '',
    conversation_starters: [],
    avatar_url: '',
    tags: [],
    knowledge_areas: []
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to create persona');
      }

      toast.success('Persona created successfully!');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Name *
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:bg-white/10 focus:border-white/20 outline-none"
          placeholder="e.g., Ratan Tata"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Category *
        </label>
        <select
          required
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as PersonaCategory }))}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:bg-white/10 focus:border-white/20 outline-none"
        >
          <option value="business">Business</option>
          <option value="entertainment">Entertainment</option>
          <option value="sports">Sports</option>
          <option value="historical">Historical</option>
          <option value="mythological">Mythological</option>
          <option value="creators">Creators</option>
        </select>
      </div>

      {/* Short Description */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Short Description * (max 255 chars)
        </label>
        <input
          type="text"
          required
          maxLength={255}
          value={formData.short_description}
          onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:bg-white/10 focus:border-white/20 outline-none"
          placeholder="e.g., Industrialist & Philanthropist"
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Full Biography *
        </label>
        <textarea
          required
          rows={6}
          value={formData.bio}
          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:bg-white/10 focus:border-white/20 outline-none resize-none"
          placeholder="Detailed biography..."
        />
      </div>

      {/* System Prompt */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          System Prompt * (will be auto-generated if empty)
        </label>
        <textarea
          rows={8}
          value={formData.system_prompt}
          onChange={(e) => setFormData(prev => ({ ...prev, system_prompt: e.target.value }))}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:bg-white/10 focus:border-white/20 outline-none resize-none font-mono text-sm"
          placeholder="Leave empty for auto-generation..."
        />
      </div>

      {/* Personality Traits */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Personality Traits (comma-separated)
        </label>
        <input
          type="text"
          value={formData.personality_traits.join(', ')}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            personality_traits: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
          }))}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:bg-white/10 focus:border-white/20 outline-none"
          placeholder="e.g., humble, visionary, ethical"
        />
      </div>

      {/* Avatar URL */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Avatar URL *
        </label>
        <input
          type="url"
          required
          value={formData.avatar_url}
          onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:bg-white/10 focus:border-white/20 outline-none"
          placeholder="https://example.com/avatar.jpg"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-white hover:bg-white/90 text-black rounded-xl transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Persona'}
        </button>
      </div>
    </form>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/admin/PersonaForm.tsx
git commit -m "feat: create admin persona form component

- Form for creating new personas
- All required and optional fields
- Category selection
- System prompt auto-generation support
- Loading states and validation"
```

---

### Task 12: Admin Page

**Files:**
- Create: `src/app/admin/personas/page.tsx`

**Step 1: Create admin personas page**

Create `src/app/admin/personas/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { DarkLayout } from '@/components/layouts/DarkLayout';
import { PersonaForm } from '@/components/admin/PersonaForm';
import { Plus } from 'lucide-react';

export default function AdminPersonasPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <DarkLayout particleCount={20}>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Admin: Personas</h1>
              <p className="text-white/60">Manage personas for the platform</p>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-white/90 text-black rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Persona
            </button>
          </div>

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-black/90 border border-white/20 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Create New Persona</h2>
                <PersonaForm
                  onSuccess={() => {
                    setShowForm(false);
                    window.location.reload();
                  }}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Start</h3>
            <ol className="list-decimal list-inside space-y-2 text-white/70">
              <li>Click "New Persona" to create a persona</li>
              <li>Fill in all required fields (marked with *)</li>
              <li>System prompt will be auto-generated if left empty</li>
              <li>Use the seed script for bulk persona creation</li>
            </ol>
          </div>
        </div>
      </div>
    </DarkLayout>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/admin/personas/page.tsx
git commit -m "feat: create admin personas management page

- Admin interface for persona CRUD
- Modal form for creating personas
- Quick start instructions
- Basic admin layout"
```

---

## DAY 6: Persona Data Seeding

### Task 13: Persona Seeding Script

**Files:**
- Create: `scripts/seed-personas.ts`
- Create: `scripts/personas-data.json`

**Step 1: Create personas data file**

Create `scripts/personas-data.json` with all 45-50 personas. Here's a template showing structure (full file would have all 45-50):

```json
[
  {
    "name": "Ratan Tata",
    "category": "business",
    "bio": "Ratan Naval Tata is an Indian industrialist and philanthropist who served as chairman of Tata Sons from 1991 to 2012 and interim chairman from 2016 to 2017. He is known for his ethical leadership, transformative vision, and philanthropic initiatives. Under his leadership, Tata Group revenues grew over 40 times, and profit over 50 times, with Tata Consultancy Services becoming a leading IT services company and Tata Motors acquiring Jaguar Land Rover.",
    "short_description": "Industrialist & Philanthropist",
    "personality_traits": ["humble", "visionary", "ethical", "compassionate", "thoughtful"],
    "conversation_starters": [
      "What was your biggest challenge at Tata Motors?",
      "How do you balance profit with social responsibility?",
      "Tell me about your philosophy on ethical business",
      "What advice would you give to young entrepreneurs?"
    ],
    "tags": ["business", "leadership", "ethics", "innovation"],
    "knowledge_areas": ["business_strategy", "ethics", "philanthropy", "innovation", "leadership"],
    "avatar_url": "/personas/ratan-tata.jpg",
    "sort_order": 1
  },
  {
    "name": "Shah Rukh Khan",
    "category": "entertainment",
    "bio": "Shah Rukh Khan, often referred to as 'King Khan', is an Indian actor, film producer, and television personality. He has appeared in more than 80 films and earned numerous accolades, including 14 Filmfare Awards. Known for his charming personality and romantic roles, he has a significant cultural impact and is one of the most successful film stars in the world. Beyond acting, he owns the production company Red Chillees Entertainment and the IPL cricket team Kolkata Knight Riders.",
    "short_description": "Bollywood Superstar & King Khan",
    "personality_traits": ["witty", "charismatic", "philosophical", "romantic", "self-aware"],
    "conversation_starters": [
      "What's the secret to your success?",
      "How do you handle failures and setbacks?",
      "Tell me about your journey from Delhi to Bollywood",
      "What keeps you motivated after 30+ years in cinema?"
    ],
    "tags": ["bollywood", "acting", "inspiration", "entertainment"],
    "knowledge_areas": ["film_industry", "acting", "success_philosophy", "perseverance"],
    "avatar_url": "/personas/shahrukh-khan.jpg",
    "sort_order": 11
  }
  // ... remaining 43-48 personas
]
```

**Step 2: Create seeding script**

Create `scripts/seed-personas.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import personasData from './personas-data.json';
import { buildSystemPrompt } from '../src/lib/utils/prompts';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedPersonas() {
  console.log('🌱 Starting persona seeding...');
  console.log(`📦 Found ${personasData.length} personas to seed`);

  let successCount = 0;
  let errorCount = 0;

  for (const personaData of personasData) {
    try {
      // Generate slug
      const slug = personaData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      // Auto-generate system prompt if not provided
      const systemPrompt = personaData.system_prompt || buildSystemPrompt({
        ...personaData,
        id: '',
        slug,
        subcategory: null,
        cover_image_url: null,
        language_capabilities: ['en', 'hi', 'hinglish'],
        is_premium: false,
        is_active: true,
        rating_average: 0,
        rating_count: 0,
        conversation_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      // Insert persona
      const { error } = await supabase
        .from('personas')
        .upsert({
          name: personaData.name,
          slug,
          category: personaData.category,
          bio: personaData.bio,
          short_description: personaData.short_description,
          personality_traits: personaData.personality_traits,
          system_prompt: systemPrompt,
          conversation_starters: personaData.conversation_starters,
          tags: personaData.tags,
          knowledge_areas: personaData.knowledge_areas,
          avatar_url: personaData.avatar_url,
          sort_order: personaData.sort_order || 0,
          is_active: true
        }, {
          onConflict: 'slug'
        });

      if (error) {
        console.error(`❌ Error seeding ${personaData.name}:`, error.message);
        errorCount++;
      } else {
        console.log(`✅ Seeded: ${personaData.name}`);
        successCount++;
      }
    } catch (error: any) {
      console.error(`❌ Exception seeding ${personaData.name}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n📊 Seeding Summary:');
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📦 Total: ${personasData.length}`);
}

seedPersonas()
  .then(() => {
    console.log('\n🎉 Seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seeding failed:', error);
    process.exit(1);
  });
```

**Step 3: Add seed script to package.json**

Add to `package.json` scripts:

```json
{
  "scripts": {
    "seed:personas": "tsx scripts/seed-personas.ts"
  }
}
```

**Step 4: Run seeding**

```bash
npm install -D tsx
npm run seed:personas
```

Expected: All 45-50 personas seeded successfully

**Step 5: Commit**

```bash
git add scripts/seed-personas.ts scripts/personas-data.json package.json
git commit -m "feat: add persona seeding script

- Complete data for 45-50 personas across 6 categories
- Auto-generation of slugs and system prompts
- Upsert logic for safe re-running
- Detailed logging and error handling"
```

---

### Task 14: Refactor Chat Interface for Personas

**Files:**
- Modify: `src/components/chat/ChatInterface.tsx`
- Create: `src/components/chat/ChatHeader.tsx`

**Step 1: Create ChatHeader component**

Create `src/components/chat/ChatHeader.tsx`:

```typescript
'use client';

import { Persona } from '@/types/persona';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Settings } from 'lucide-react';

interface ChatHeaderProps {
  persona: Persona;
}

export function ChatHeader({ persona }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-black/40 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center gap-3">
        <Link
          href="/personas"
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>

        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden">
            <Image
              src={persona.avatar_url}
              alt={persona.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-white font-semibold">{persona.name}</h2>
            <p className="text-white/60 text-sm">{persona.short_description}</p>
          </div>
        </div>
      </div>

      <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
        <Settings className="w-5 h-5 text-white" />
      </button>
    </div>
  );
}
```

**Step 2: Refactor ChatInterface to accept persona**

Modify `src/components/chat/ChatInterface.tsx` to add persona support:

```typescript
// Add persona prop to interface
interface ChatInterfaceProps {
  sessionId: string;
  persona: Persona;  // NEW
}

// Update component signature
export function ChatInterface({ sessionId, persona }: ChatInterfaceProps) {
  // Update sendMessage to include personaId
  const sendMessage = async (content: string) => {
    // ... existing code

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          sessionId,
          personaId: persona.id,  // NEW
          conversationId: currentConversationId,
          history: messages,
        }),
      });

      // ... rest of existing code
    }
  };

  // Replace existing header with new ChatHeader
  return (
    <DarkLayout particleCount={20}>
      <div className="flex flex-col h-screen">
        {/* NEW: Use ChatHeader */}
        <ChatHeader persona={persona} />

        {/* Rest of existing component */}
        {/* ... */}
      </div>
    </DarkLayout>
  );
}
```

**Step 3: Commit**

```bash
git add src/components/chat/ChatHeader.tsx src/components/chat/ChatInterface.tsx
git commit -m "feat: add persona-aware chat interface

- ChatHeader component showing persona info
- Pass persona to chat API calls
- Back button to personas library
- Reduced particles for chat focus"
```

---

### Task 15: Dynamic Chat Page

**Files:**
- Modify: `src/app/chat/page.tsx` → `src/app/chat/[personaSlug]/page.tsx`

**Step 1: Create dynamic chat route**

Create `src/app/chat/[personaSlug]/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useFingerprint } from '@/hooks/useFingerprint';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { FullPageLoader } from '@/components/shared/Loader';
import { Persona } from '@/types/persona';
import { toast } from 'sonner';

export default function PersonaChatPage() {
  const params = useParams();
  const personaSlug = params.personaSlug as string;

  const { fingerprint, isLoading: fingerprintLoading } = useFingerprint();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (personaSlug) {
      fetchPersona();
    }
  }, [personaSlug]);

  async function fetchPersona() {
    try {
      setLoading(true);
      const response = await fetch(`/api/personas/${personaSlug}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Persona not found');
      }

      setPersona(result.data.persona);
    } catch (error: any) {
      console.error('Error fetching persona:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (fingerprintLoading || loading) {
    return <FullPageLoader />;
  }

  if (!fingerprint) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md backdrop-blur-xl bg-black/60 rounded-3xl p-12 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-2">Unable to Start Session</h2>
          <p className="text-white/70 mb-6">Could not initialize chat session. Please refresh the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-white text-black rounded-xl hover:bg-white/90 transition-colors font-semibold"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  if (!persona) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md backdrop-blur-xl bg-black/60 rounded-3xl p-12 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-2">Persona Not Found</h2>
          <p className="text-white/70 mb-6">The persona you're looking for doesn't exist.</p>
          <Link
            href="/personas"
            className="px-6 py-3 bg-white text-black rounded-xl hover:bg-white/90 transition-colors font-semibold inline-block"
          >
            Browse Personas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ChatInterface
      sessionId={fingerprint}
      persona={persona}
    />
  );
}
```

**Step 2: Commit**

```bash
git add src/app/chat/[personaSlug]/page.tsx
git commit -m "feat: create dynamic persona chat page

- Dynamic routing for persona-specific chats
- Fetch persona by slug from URL
- Error handling for invalid personas
- Loading states
- Fingerprint-based session management"
```

---

## DAY 7: Polish, Testing & Deployment

### Task 16: Guest Limit Banner Component

**Files:**
- Create: `src/components/chat/GuestLimitBanner.tsx`

**Step 1: Create guest limit banner**

Create `src/components/chat/GuestLimitBanner.tsx`:

```typescript
'use client';

import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface GuestLimitBannerProps {
  current: number;
  max: number;
  remainingMessages: number;
}

export function GuestLimitBanner({ current, max, remainingMessages }: GuestLimitBannerProps) {
  const percentage = (current / max) * 100;

  return (
    <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 backdrop-blur-xl rounded-xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-orange-300 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-orange-200 text-sm font-medium mb-2">
            {remainingMessages > 0
              ? `${remainingMessages} messages remaining`
              : 'Message limit reached'}
          </p>

          {/* Progress bar */}
          <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <p className="text-orange-100/80 text-xs mb-3">
            Sign up to continue chatting with unlimited messages
          </p>

          <Link
            href="/"
            className="inline-block px-4 py-2 bg-white text-black rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors"
          >
            Sign Up Now
          </Link>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Integrate into ChatInterface**

Modify `src/components/chat/ChatInterface.tsx` to show guest banner:

```typescript
// Add guest status state
const [guestStatus, setGuestStatus] = useState<{ current: number; max: number } | null>(null);

// Update after receiving chat response
if (data.guestLimit) {
  setGuestStatus({
    current: data.guestLimit.current,
    max: data.guestLimit.max
  });
}

// Render banner in message area
{guestStatus && guestStatus.current >= 7 && (
  <GuestLimitBanner
    current={guestStatus.current}
    max={guestStatus.max}
    remainingMessages={guestStatus.max - guestStatus.current}
  />
)}
```

**Step 3: Commit**

```bash
git add src/components/chat/GuestLimitBanner.tsx src/components/chat/ChatInterface.tsx
git commit -m "feat: add guest limit warning banner

- Progress bar showing message usage
- Warning at 7+ messages
- Sign up CTA button
- Integrate into chat interface"
```

---

### Task 17: Conversation Starters Component

**Files:**
- Create: `src/components/chat/ConversationStarters.tsx`

**Step 1: Create conversation starters**

Create `src/components/chat/ConversationStarters.tsx`:

```typescript
'use client';

import { Sparkles } from 'lucide-react';

interface ConversationStartersProps {
  starters: string[];
  onSelect: (starter: string) => void;
}

export function ConversationStarters({ starters, onSelect }: ConversationStartersProps) {
  if (!starters || starters.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-white/60" />
        <h3 className="text-sm font-medium text-white/60">Suggested questions</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {starters.slice(0, 4).map((starter, index) => (
          <button
            key={index}
            onClick={() => onSelect(starter)}
            className="text-left p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all text-sm text-white/80 hover:text-white"
          >
            {starter}
          </button>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Integrate into ChatInterface**

Add to `src/components/chat/ChatInterface.tsx`:

```typescript
// Show starters when no messages
{messages.length === 0 && (
  <ConversationStarters
    starters={persona.conversation_starters}
    onSelect={(starter) => sendMessage(starter)}
  />
)}
```

**Step 3: Commit**

```bash
git add src/components/chat/ConversationStarters.tsx src/components/chat/ChatInterface.tsx
git commit -m "feat: add conversation starters to chat

- Display suggested questions on empty chat
- Grid layout for starters
- Click to auto-fill and send message"
```

---

### Task 18: Final Testing & Bug Fixes

**Files:**
- Various (bug fixes as discovered)

**Step 1: Manual testing checklist**

Run through complete user flow:

1. **Landing page:**
   - [ ] Hero shows "Chat with India's Icons"
   - [ ] Sign up buttons work
   - [ ] Guest mode redirects to /personas

2. **Personas page:**
   - [ ] All personas load
   - [ ] Category filter works
   - [ ] Search works
   - [ ] Cards clickable

3. **Chat page:**
   - [ ] Persona info shows in header
   - [ ] Messages send and receive
   - [ ] Gemini responses in character
   - [ ] Hinglish code-switching works
   - [ ] Conversation starters appear
   - [ ] Guest limit enforced at 10 messages
   - [ ] Banner shows at 7+ messages

4. **Guest mode:**
   - [ ] Can chat without signup
   - [ ] Counter increments
   - [ ] Blocked at 10 messages
   - [ ] Sign up prompt appears

5. **Admin:**
   - [ ] Can create new persona
   - [ ] Form validation works
   - [ ] Personas appear in library

**Step 2: Fix any bugs found**

Document and fix issues as discovered.

**Step 3: Commit bug fixes**

```bash
git add <files>
git commit -m "fix: [description of bug fix]"
```

---

### Task 19: Production Build & Environment Check

**Files:**
- `.env.production`
- `vercel.json` (if using Vercel)

**Step 1: Create production environment file**

Create `.env.production`:

```env
NEXT_PUBLIC_SUPABASE_URL=<production-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<production-key>
GEMINI_API_KEY=<production-key>
SUPABASE_SERVICE_ROLE_KEY=<production-key>
```

**Step 2: Test production build**

```bash
npm run build
npm run start
```

Test on `http://localhost:3000` - all features should work.

**Step 3: Deploy to production**

For Vercel:
```bash
vercel --prod
```

For other platforms, follow their deployment docs.

**Step 4: Run seed script on production**

```bash
# Set production env vars
export NEXT_PUBLIC_SUPABASE_URL=<prod-url>
export SUPABASE_SERVICE_ROLE_KEY=<prod-key>

# Run seed
npm run seed:personas
```

**Step 5: Commit**

```bash
git add .env.production
git commit -m "chore: prepare production environment

- Add production environment variables template
- Test production build
- Deploy to hosting platform
- Seed production database with personas"
```

---

### Task 20: Documentation & Handoff

**Files:**
- Create: `README.md` (update)
- Create: `docs/DEPLOYMENT.md`
- Create: `docs/ADMIN-GUIDE.md`

**Step 1: Update README**

Add to `README.md`:

```markdown
# Esperit - Chat with India's Icons

AI-powered conversational platform featuring 45-50 curated personas of Indian business leaders, celebrities, historical figures, and mythological characters.

## Features

- 🎭 45-50 personas across 6 categories
- 💬 Persona-aware conversations with Gemini AI
- 🇮🇳 Hinglish code-switching support
- 👤 Guest mode (10 messages) + full auth
- 🎨 Beautiful UI with floating particles
- 🔒 Supabase backend with RLS

## Quick Start

\`\`\`bash
npm install
npm run dev
\`\`\`

Visit `http://localhost:3000`

## Seeding Personas

\`\`\`bash
npm run seed:personas
\`\`\`

## Tech Stack

- Next.js 14, React 18, TypeScript
- Supabase (PostgreSQL + Auth)
- Google Gemini AI
- Tailwind CSS + Framer Motion

## Documentation

- [Deployment Guide](docs/DEPLOYMENT.md)
- [Admin Guide](docs/ADMIN-GUIDE.md)
- [Design Document](docs/plans/2025-10-28-esperit-persona-platform-design.md)
```

**Step 2: Create deployment guide**

Create `docs/DEPLOYMENT.md` with deployment instructions.

**Step 3: Create admin guide**

Create `docs/ADMIN-GUIDE.md` with admin panel usage instructions.

**Step 4: Final commit**

```bash
git add README.md docs/DEPLOYMENT.md docs/ADMIN-GUIDE.md
git commit -m "docs: add comprehensive documentation

- Update README with feature overview
- Add deployment guide
- Add admin guide
- Reference design document"
```

---

## Execution Complete! 🎉

**Sprint Summary:**
- ✅ Database schema with personas + conversations
- ✅ Complete API layer (personas, chat, guest)
- ✅ 45-50 personas seeded
- ✅ Persona library with search/filter
- ✅ Persona-aware chat with Gemini
- ✅ Guest mode (10 message limit)
- ✅ Admin UI for management
- ✅ Production deployment
- ✅ Full documentation

**Next Steps:**
1. Monitor initial user feedback
2. Refine persona prompts based on conversations
3. Add analytics tracking
4. Plan premium tier features

---

## Plan Complete

This implementation plan provides a complete, day-by-day breakdown of all tasks needed to transform Esperit into the persona platform. Each task includes:

- Exact file paths
- Complete code snippets
- Step-by-step instructions
- Test verification steps
- Commit messages

Ready to execute!
