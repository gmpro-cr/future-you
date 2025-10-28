# Task 1: Database Schema Migration - Personas Table

## Status: FILES CREATED ✅ | MIGRATION PENDING ⏳

### Files Created

1. **Migration SQL**: `supabase/migrations/20251028_create_personas_table.sql`
   - Complete personas table schema
   - Indexes for category, slug, active status, sort_order
   - RLS policies for public and authenticated access
   - Auto-update trigger for updated_at column

2. **TypeScript Types**: `src/types/persona.ts`
   - `Persona` interface (full entity)
   - `PersonaCategory` type (union of 6 categories)
   - `PersonaCardData` interface (display data)
   - `CreatePersonaInput` interface (creation payload)

3. **Helper Scripts**:
   - `scripts/migration-sql-to-run.sql` - Ready-to-execute SQL
   - `scripts/verify-personas-migration.js` - Verification script
   - `scripts/run-migration-direct.js` - Migration guide

### Migration Execution Required

The migration SQL needs to be executed manually via Supabase Dashboard:

**STEPS:**
1. Go to: https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg/sql/new
2. Open file: `scripts/migration-sql-to-run.sql`
3. Copy the entire SQL content
4. Paste into Supabase SQL Editor
5. Click "Run"
6. Verify success message
7. Check Database → Tables for "personas" table

**After migration, run:**
```bash
node scripts/verify-personas-migration.js
```

### Current Database State

- **Old personas table exists** with different schema:
  - Columns: id, created_at, type, name, description, emoji, system_prompt, tone_attributes, is_active, session_identifier, is_public
  
- **Migration will:**
  - Drop the old table
  - Create new table with proper schema for persona platform

### Expected Table Schema

```sql
personas (
  id UUID PRIMARY KEY,
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
  language_capabilities TEXT[],
  is_premium BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  rating_average DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  conversation_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### Next Steps

1. Execute migration in Supabase Dashboard (manual step)
2. Run verification: `node scripts/verify-personas-migration.js`
3. Commit changes with message from plan
4. Proceed to Task 2

---

**Note**: Automated migration via API/CLI not possible without database password or Supabase CLI.
Manual execution via Dashboard is the intended and recommended approach per task instructions.
