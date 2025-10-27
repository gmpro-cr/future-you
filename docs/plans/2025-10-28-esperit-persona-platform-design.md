# Esperit Persona Platform - Design Document

**Date:** October 28, 2025
**Timeline:** 1 Week Sprint (No Compromises)
**Status:** Approved for Implementation

---

## Executive Summary

Transform Esperit from "Future Self" concept to a persona-based conversational AI platform featuring 45-50 curated Indian personalities across 6 categories. Full-featured MVP including persona library, persona-aware chat, guest mode, authentication, and admin UI - all delivered in one week.

**Core Value Proposition:** Chat with India's icons - business leaders, celebrities, historical figures, and mythological characters - all powered by Gemini AI with culturally-aware personality prompts.

---

## Architecture Overview

### Technology Stack (Preserved)
- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **UI Framework:** Existing DarkLayout with floating particles
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **AI Provider:** Google Gemini API (existing integration)
- **Deployment:** Vercel (frontend) + Supabase Cloud

### Transformation Strategy
**Approach:** Page-by-Page Replacement
**Philosophy:** Incremental transformation maintaining working app at each step
**Risk Mitigation:** Evolve existing schema rather than rebuild from scratch

---

## Data Model

### New Tables

#### 1. `personas` Table
```sql
CREATE TABLE personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,
  subcategory VARCHAR(50),
  avatar_url TEXT NOT NULL,
  cover_image_url TEXT,
  bio TEXT NOT NULL,
  short_description VARCHAR(255) NOT NULL,
  personality_traits JSONB NOT NULL,
  system_prompt TEXT NOT NULL,
  conversation_starters TEXT[] NOT NULL,
  tags TEXT[],
  knowledge_areas TEXT[],
  language_capabilities TEXT[] DEFAULT ARRAY['en', 'hi', 'hinglish'],
  is_premium BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  rating_average DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  conversation_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_personas_category ON personas(category);
CREATE INDEX idx_personas_slug ON personas(slug);
CREATE INDEX idx_personas_active ON personas(is_active);
```

**Persona Categories:**
- `business` - Business Icons (10 personas)
- `entertainment` - Bollywood/Hollywood (10 personas)
- `sports` - Athletes (9 personas)
- `historical` - Historical/Spiritual (9 personas)
- `mythological` - Fictional/Mythological (8 personas)
- `creators` - Content Creators (3 personas)

#### 2. Schema Migrations for Existing Tables

```sql
-- Add persona support to conversations
ALTER TABLE conversations
  ADD COLUMN persona_id UUID REFERENCES personas(id),
  ADD COLUMN is_guest_session BOOLEAN DEFAULT FALSE,
  ADD COLUMN guest_message_count INTEGER DEFAULT 0;

CREATE INDEX idx_conversations_persona ON conversations(persona_id);

-- Add persona tracking to messages (already has conversation_id FK)
-- No changes needed to messages table structure
```

#### 3. `user_preferences` Table
```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  favorite_personas UUID[] DEFAULT ARRAY[]::UUID[],
  recent_personas UUID[] DEFAULT ARRAY[]::UUID[],
  language_preference VARCHAR(10) DEFAULT 'en',
  theme_preference VARCHAR(20) DEFAULT 'dark',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. `admin_users` Table
```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  role VARCHAR(20) NOT NULL DEFAULT 'moderator',
  permissions JSONB DEFAULT '{"personas": {"create": true, "edit": true, "delete": false}}',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## System Prompt Architecture

### Prompt Template Structure
Each persona has a detailed system prompt that guides Gemini's personality:

```
You are {name}, {short_description}.

BIOGRAPHY:
{bio}

PERSONALITY TRAITS:
{personality_traits as bullet points}

COMMUNICATION STYLE:
- Use Hinglish naturally when appropriate
- Reference your real experiences and known philosophy
- Maintain authenticity to your public persona
- Be warm, relatable, and culturally aware of Indian context

KNOWLEDGE AREAS:
{knowledge_areas as bullet points}

RESPONSE GUIDELINES:
1. Stay in character consistently
2. Draw from your known history and expertise
3. Be inspiring yet humble
4. Use culturally relevant examples
5. Code-switch between English and Hindi naturally
6. Reference Indian festivals, traditions, and social context when relevant

Remember: You are speaking with someone seeking guidance, entertainment, or inspiration. Be the best version of {name} that you can be.
```

### Example Persona Configurations

**Ratan Tata (Business Icon):**
```json
{
  "name": "Ratan Tata",
  "category": "business",
  "personality_traits": ["humble", "visionary", "ethical", "compassionate", "thoughtful"],
  "knowledge_areas": ["business_strategy", "ethics", "philanthropy", "innovation", "leadership"],
  "conversation_starters": [
    "What was your biggest challenge at Tata Motors?",
    "How do you balance profit with social responsibility?",
    "Tell me about your philosophy on ethical business"
  ]
}
```

**Shah Rukh Khan (Entertainment):**
```json
{
  "name": "Shah Rukh Khan",
  "category": "entertainment",
  "personality_traits": ["witty", "charismatic", "philosophical", "romantic", "self-aware"],
  "knowledge_areas": ["acting", "film_industry", "success_philosophy", "perseverance"],
  "conversation_starters": [
    "What's the secret to your success?",
    "How do you handle failures?",
    "Tell me about your journey from Delhi to Bollywood"
  ]
}
```

---

## API Architecture

### New API Routes

#### Persona Management
```typescript
// GET /api/personas - List all personas with filtering
interface PersonasQuery {
  category?: string;
  search?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
  is_premium?: boolean;
}

// Response
interface PersonasResponse {
  personas: Persona[];
  total: number;
  categories: { name: string; count: number }[];
}

// GET /api/personas/[slug] - Get single persona
interface PersonaDetailResponse {
  persona: Persona;
  relatedPersonas: Persona[];
}

// POST /api/personas - Create persona (admin only)
// PUT /api/personas/[id] - Update persona (admin only)
// DELETE /api/personas/[id] - Soft delete persona (admin only)
```

#### Enhanced Chat Route
```typescript
// POST /api/chat - Modified to include persona context
interface ChatRequest {
  message: string;
  conversationId?: string;
  personaId: string;  // NEW
  sessionId: string;
}

interface ChatResponse {
  message: string;
  conversationId: string;
  messageCount: number;
  guestLimit?: {
    current: number;
    max: number;
    requiresAuth: boolean;
  };
}
```

#### Guest Session Management
```typescript
// GET /api/guest/status - Check guest session status
interface GuestStatusResponse {
  isGuest: boolean;
  messageCount: number;
  remainingMessages: number;
  conversationIds: string[];
}
```

---

## Frontend Architecture

### Page Structure

#### 1. Home Page `/` - TRANSFORM
**Purpose:** Marketing landing page showcasing platform value

**Components:**
- Hero section with updated messaging
- Featured personas carousel (top 6 personas)
- Category showcase sections
- Auth CTAs (Google + Guest)
- Maintains: DarkLayout, floating particles

**Key Changes:**
- Update hero: "Talk to Your Favourite AI Spirit" → "Chat with India's Icons"
- Add featured personas with avatars
- Update value propositions

#### 2. Personas Library `/personas` - NEW
**Purpose:** Main persona discovery and selection interface

**Layout:**
```
Header (sticky)
├── Search bar
├── Category tabs (All, Business, Entertainment, Sports, etc.)
└── View toggle (Grid/List)

Main Content
├── Active filters display
├── Persona Grid/List
│   └── PersonaCard[] (48 cards, 8 per category)
└── Pagination (if needed)

Sidebar (desktop)
├── Category filter
├── Tags filter
└── Quick stats
```

**PersonaCard Component:**
```typescript
interface PersonaCardProps {
  persona: {
    name: string;
    slug: string;
    category: string;
    avatar_url: string;
    short_description: string;
    tags: string[];
    conversation_count: number;
  };
  onSelect: (slug: string) => void;
}
```

#### 3. Chat Page `/chat/[personaSlug]` - REFACTOR
**Purpose:** Persona-aware conversation interface

**Layout:**
```
ChatHeader (NEW)
├── PersonaAvatar
├── PersonaName + Category badge
├── "Change Persona" button
└── Menu (conversation history, settings)

ConversationStarters (NEW - shown if no messages)
└── Suggested questions grid

MessageList (EXISTING - keep)
└── MessageBubbles with timestamps

GuestLimitBanner (NEW - shown when approaching limit)
└── "X messages remaining" with signup CTA

InputArea (EXISTING - keep)
```

**Refactoring Strategy:**
- Keep existing ChatInterface structure
- Add persona prop to component
- Inject persona context into API calls
- Add header section with persona info
- Show conversation starters on empty state

#### 4. Admin Panel `/admin/personas` - NEW
**Purpose:** Persona CRUD interface for admins

**Features:**
- List all personas with quick edit
- Create new persona form
- Edit existing persona
- Upload/manage avatar images
- Preview persona chat
- Bulk operations (activate/deactivate)

---

## Component Architecture

### New Components

#### `/components/personas/`

**PersonaCard.tsx**
```typescript
export function PersonaCard({ persona }: { persona: Persona }) {
  return (
    <motion.div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10">
      <div className="aspect-square relative">
        <Image src={persona.avatar_url} alt={persona.name} fill />
      </div>
      <div className="p-4">
        <h3>{persona.name}</h3>
        <p className="text-sm text-white/60">{persona.short_description}</p>
        <div className="flex gap-2 mt-2">
          {persona.tags.map(tag => (
            <span key={tag} className="text-xs px-2 py-1 bg-white/10 rounded">
              {tag}
            </span>
          ))}
        </div>
        <Link href={`/chat/${persona.slug}`}>
          <Button>Start Chat</Button>
        </Link>
      </div>
    </motion.div>
  );
}
```

**PersonaSelector.tsx**
```typescript
export function PersonaSelector({
  currentPersona,
  onSelect
}: {
  currentPersona: Persona;
  onSelect: (persona: Persona) => void;
}) {
  // Modal with persona grid for switching personas mid-conversation
}
```

**CategoryFilter.tsx**
```typescript
export function CategoryFilter({
  categories,
  selected,
  onChange
}: CategoryFilterProps) {
  // Tab-based category filter
}
```

### Refactored Components

#### `/components/chat/ChatInterface.tsx`
```typescript
interface ChatInterfaceProps {
  sessionId: string;
  persona: Persona;  // NEW prop
}

export function ChatInterface({ sessionId, persona }: ChatInterfaceProps) {
  // Existing logic + persona integration
  // Pass persona to API calls
  // Show persona header
  // Track guest message limits
}
```

---

## Gemini API Integration

### Enhanced Chat Flow

```typescript
// /app/api/chat/route.ts

export async function POST(req: Request) {
  const { message, conversationId, personaId, sessionId } = await req.json();

  // 1. Fetch persona
  const persona = await supabase
    .from('personas')
    .select('*')
    .eq('id', personaId)
    .single();

  // 2. Check guest limits
  const { isGuest, messageCount } = await checkGuestStatus(sessionId);
  if (isGuest && messageCount >= 10) {
    return NextResponse.json({
      error: 'GUEST_LIMIT_REACHED',
      requiresAuth: true
    }, { status: 403 });
  }

  // 3. Fetch conversation history
  const messages = await getConversationMessages(conversationId);

  // 4. Build Gemini request with persona context
  const systemInstruction = buildSystemPrompt(persona);

  const geminiResponse = await gemini.generateContent({
    systemInstruction: {
      role: 'system',
      parts: [{ text: systemInstruction }]
    },
    contents: [
      ...messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })),
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ],
    generationConfig: {
      temperature: 0.8,  // Personality variation
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 500,
    }
  });

  // 5. Save messages
  await saveMessages(conversationId, [
    { role: 'user', content: message },
    { role: 'assistant', content: geminiResponse.text }
  ]);

  // 6. Update counters
  await incrementMessageCount(conversationId, personaId);

  return NextResponse.json({
    message: geminiResponse.text,
    conversationId,
    messageCount: messageCount + 1,
    guestLimit: isGuest ? { current: messageCount + 1, max: 10 } : null
  });
}

function buildSystemPrompt(persona: Persona): string {
  return `You are ${persona.name}, ${persona.short_description}.

BIOGRAPHY:
${persona.bio}

PERSONALITY TRAITS:
${persona.personality_traits.join(', ')}

COMMUNICATION STYLE:
- Use Hinglish naturally when appropriate
- Reference your real experiences and known philosophy
- Maintain authenticity to your public persona
- Be warm, relatable, and culturally aware of Indian context

KNOWLEDGE AREAS:
${persona.knowledge_areas.join(', ')}

RESPONSE GUIDELINES:
1. Stay in character consistently
2. Draw from your known history and expertise
3. Be inspiring yet humble
4. Use culturally relevant examples
5. Code-switch between English and Hindi naturally
6. Reference Indian festivals, traditions, and social context when relevant

Remember: You are speaking with someone seeking guidance, entertainment, or inspiration. Be the best version of ${persona.name} that you can be.`;
}
```

---

## Guest Mode Implementation

### Flow Diagram
```
New User Arrives → Fingerprint Generated → Browse Personas → Select Persona →
Start Chat (guest_message_count = 0) → Message 1-9 (show subtle counter) →
Message 10 (show prominent signup CTA) → Attempt Message 11 → Block + Modal →
User Signs Up → Conversations Migrate → Continue Unlimited
```

### Technical Implementation

```typescript
// /lib/utils/guestMode.ts

export async function checkGuestStatus(sessionId: string) {
  // Check if authenticated user
  const { data: { session } } = await supabase.auth.getSession();
  if (session) return { isGuest: false, messageCount: 0 };

  // Count guest messages for this session
  const { data: conversations } = await supabase
    .from('conversations')
    .select('guest_message_count')
    .eq('session_id', sessionId)
    .eq('is_guest_session', true);

  const totalMessages = conversations?.reduce(
    (sum, conv) => sum + (conv.guest_message_count || 0),
    0
  ) || 0;

  return { isGuest: true, messageCount: totalMessages };
}

export async function migrateGuestConversations(
  guestSessionId: string,
  userId: string
) {
  // Find all guest conversations for this session
  const { data: guestConversations } = await supabase
    .from('conversations')
    .select('*')
    .eq('session_id', guestSessionId)
    .eq('is_guest_session', true);

  // Update to associate with user
  for (const conv of guestConversations || []) {
    await supabase
      .from('conversations')
      .update({
        user_id: userId,
        is_guest_session: false
      })
      .eq('id', conv.id);
  }
}
```

---

## Admin UI Design

### Admin Dashboard `/admin/personas`

**Features:**
1. **Persona List View**
   - Sortable table (name, category, status, conversation_count)
   - Quick actions (edit, deactivate, delete)
   - Bulk operations
   - Export to JSON

2. **Create/Edit Persona Form**
   - Name, slug (auto-generated)
   - Category dropdown
   - Avatar upload (Supabase Storage)
   - Bio (rich text editor)
   - Personality traits (tag input)
   - System prompt (textarea with preview)
   - Conversation starters (multi-input)
   - Tags (tag input)
   - Premium flag checkbox

3. **Persona Preview**
   - Live chat preview with test messages
   - System prompt validation
   - Response quality check

4. **Analytics Dashboard**
   - Top personas by conversation count
   - Category distribution
   - User engagement metrics

### Security

```typescript
// Middleware for admin routes
export async function adminMiddleware(req: Request) {
  const session = await getSession(req);

  if (!session) {
    return Response.redirect('/login');
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (!adminUser) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  return null; // Allow access
}
```

---

## Persona Data Seeding Strategy

### Initial 45-50 Personas Breakdown

**Business & Leadership (10):**
1. Ratan Tata - Industrialist
2. Narayana Murthy - Infosys Founder
3. Mukesh Ambani - Reliance Chairman
4. Kiran Mazumdar-Shaw - Biotech Pioneer
5. Nandan Nilekani - Tech Visionary
6. Elon Musk - Global Innovator
7. Azim Premji - Wipro Chairman
8. Falguni Nayar - Nykaa Founder
9. Vijay Shekhar Sharma - Paytm Founder
10. Anand Mahindra - Mahindra Group

**Entertainment (10):**
1. Shah Rukh Khan
2. Deepika Padukone
3. Aamir Khan
4. Priyanka Chopra
5. Amitabh Bachchan
6. Kangana Ranaut
7. Rajinikanth
8. Alia Bhatt
9. AR Rahman
10. Lata Mangeshkar

**Sports (9):**
1. Virat Kohli
2. MS Dhoni
3. Sachin Tendulkar
4. PV Sindhu
5. Mary Kom
6. Neeraj Chopra
7. Sania Mirza
8. Sunil Chhetri
9. Abhinav Bindra

**Historical/Spiritual (9):**
1. APJ Abdul Kalam
2. Mahatma Gandhi
3. Swami Vivekananda
4. Subhas Chandra Bose
5. Rani Lakshmibai
6. Sarojini Naidu
7. BR Ambedkar
8. Sardar Patel
9. Mother Teresa

**Mythological/Fictional (8):**
1. Tenali Raman
2. Birbal
3. Chanakya
4. Krishna (Mahabharata)
5. Hanuman
6. Draupadi
7. Sherlock Holmes (Indian adaptation)
8. Malgudi Days Swami

**Content Creators (3):**
1. Bhuvan Bam (BB Ki Vines)
2. Prajakta Koli (MostlySane)
3. Tanmay Bhat (AIB/Comedian)

### Data Seeding Script

```typescript
// /scripts/seed-personas.ts

const personasData = [
  {
    name: "Ratan Tata",
    slug: "ratan-tata",
    category: "business",
    avatar_url: "/personas/ratan-tata.jpg",
    bio: "Indian industrialist, philanthropist, and former chairman of Tata Sons...",
    short_description: "Industrialist & Philanthropist",
    personality_traits: ["humble", "visionary", "ethical", "compassionate"],
    system_prompt: "You are Ratan Tata...",
    conversation_starters: [
      "What was your biggest challenge at Tata Motors?",
      "How do you balance profit with social responsibility?",
      "Tell me about your philosophy on ethical business"
    ],
    tags: ["business", "leadership", "ethics", "philanthropy"],
    knowledge_areas: ["business_strategy", "ethics", "innovation"],
    is_premium: false,
    is_active: true,
    sort_order: 1
  },
  // ... 44 more personas
];

async function seedPersonas() {
  for (const persona of personasData) {
    await supabase.from('personas').insert(persona);
  }
}
```

---

## Testing Strategy

### Unit Tests
- Persona API routes
- Guest mode logic
- System prompt generation
- Message count tracking

### Integration Tests
- Full chat flow with persona
- Guest to registered user migration
- Admin persona CRUD operations

### Manual Testing Checklist
- [ ] Browse personas by category
- [ ] Search personas
- [ ] Start chat as guest
- [ ] Hit 10-message limit
- [ ] Sign up and continue
- [ ] Switch personas mid-conversation
- [ ] Admin create/edit persona
- [ ] Test Gemini responses for personality consistency

---

## Deployment Checklist

### Database
- [ ] Run schema migrations on Supabase
- [ ] Seed initial 45-50 personas
- [ ] Set up Row Level Security policies
- [ ] Create admin users

### Frontend
- [ ] Build and test locally
- [ ] Deploy to Vercel
- [ ] Verify environment variables
- [ ] Test production URLs

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure analytics (Posthog/Mixpanel)
- [ ] Set up uptime monitoring
- [ ] Create admin alerts

---

## Success Metrics (Week 1)

### User Engagement
- **Target:** 100+ signups in first week
- **Metric:** Average 5+ messages per user
- **Goal:** 60%+ guest-to-registered conversion

### Technical Performance
- **API Latency:** <2 seconds P95
- **Uptime:** >99.5%
- **Error Rate:** <1%

### Content Quality
- **Persona Coverage:** All 6 categories represented
- **Response Quality:** Manual review of 100+ conversations
- **User Satisfaction:** Collect feedback from first 50 users

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Gemini API rate limits | High | Implement caching, queue system |
| Poor persona quality | High | Thorough testing, quick iteration on prompts |
| Guest abuse | Medium | Rate limiting, fingerprint tracking |
| Database performance | Medium | Proper indexing, query optimization |
| Image loading slow | Low | CDN, optimized images, lazy loading |

---

## Post-Launch Roadmap (Week 2+)

### Week 2: Optimization
- Performance tuning
- Bug fixes from user feedback
- Persona prompt refinement
- Analytics review

### Week 3-4: Enhancements
- Voice interactions (text-to-speech)
- Advanced search with tags
- User favorites and history
- Social sharing features

### Month 2: Monetization
- Premium tier implementation
- Payment integration
- Exclusive premium personas
- API access for developers

---

## Appendix: File Structure

```
/Esperit
├── /app
│   ├── /admin
│   │   └── /personas
│   │       ├── page.tsx          (NEW: Admin dashboard)
│   │       ├── /create
│   │       │   └── page.tsx      (NEW: Create persona)
│   │       └── /[id]
│   │           └── page.tsx      (NEW: Edit persona)
│   ├── /personas
│   │   ├── page.tsx              (NEW: Persona library)
│   │   └── /[slug]
│   │       └── page.tsx          (NEW: Persona detail - optional)
│   ├── /chat
│   │   └── /[personaSlug]
│   │       └── page.tsx          (REFACTOR: Dynamic persona chat)
│   ├── /api
│   │   ├── /personas
│   │   │   ├── route.ts          (NEW: List personas)
│   │   │   └── /[slug]
│   │   │       └── route.ts      (NEW: Get persona)
│   │   ├── /chat
│   │   │   └── route.ts          (REFACTOR: Add persona context)
│   │   ├── /guest
│   │   │   └── /status
│   │   │       └── route.ts      (NEW: Guest status)
│   │   └── /admin
│   │       └── /personas
│   │           └── route.ts      (NEW: Admin CRUD)
│   └── page.tsx                  (REFACTOR: Update landing)
├── /components
│   ├── /personas
│   │   ├── PersonaCard.tsx       (NEW)
│   │   ├── PersonaGrid.tsx       (NEW)
│   │   ├── PersonaFilters.tsx    (NEW)
│   │   ├── PersonaSelector.tsx   (NEW)
│   │   └── CategoryFilter.tsx    (NEW)
│   ├── /chat
│   │   ├── ChatInterface.tsx     (REFACTOR: Add persona)
│   │   ├── ChatHeader.tsx        (NEW)
│   │   ├── ConversationStarters.tsx (NEW)
│   │   └── GuestLimitBanner.tsx  (NEW)
│   └── /admin
│       ├── PersonaForm.tsx       (NEW)
│       ├── PersonaList.tsx       (NEW)
│       └── PersonaPreview.tsx    (NEW)
├── /lib
│   ├── /api
│   │   └── personas.ts           (NEW: Persona API client)
│   └── /utils
│       ├── guestMode.ts          (NEW: Guest utilities)
│       └── prompts.ts            (NEW: System prompt builder)
├── /scripts
│   └── seed-personas.ts          (NEW: Data seeding)
├── /docs
│   └── /plans
│       └── 2025-10-28-esperit-persona-platform-design.md
└── /public
    └── /personas
        └── (50 avatar images)
```

---

## Conclusion

This design provides a complete blueprint for transforming Esperit into a persona-based conversational AI platform within one week. The page-by-page replacement strategy minimizes risk while the database-first approach ensures scalability. All 45-50 personas, full admin UI, advanced filtering, and complete guest mode will be delivered with no compromises.

**Next Steps:**
1. Set up git worktree for isolated development
2. Create detailed implementation plan with task breakdown
3. Begin parallel development across frontend/backend/data

---

**Document Status:** ✅ Approved for Implementation
**Ready for:** Phase 5 (Worktree Setup) and Phase 6 (Implementation Planning)
