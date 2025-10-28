# Task 2: Extend Conversations Schema - Manual Execution Required

## Overview
This migration extends the `conversations` table to support persona-based conversations and guest session tracking.

## Migration File
`20251028_extend_conversations_for_personas.sql`

## Changes Made
1. Added `session_id` column (TEXT) for tracking both guest and authenticated users
2. Added `persona_id` column (UUID) with foreign key to personas table
3. Added `is_guest_session` column (BOOLEAN) to track guest sessions
4. Added `guest_message_count` column (INTEGER) to enforce 10-message limit
5. Created index on `persona_id` for efficient lookups
6. Created composite index on `(session_id, is_guest_session)` for guest queries
7. Added column comments for documentation

## Manual Execution Steps

### Step 1: Access Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to: SQL Editor

### Step 2: Run the Migration
1. Open the file: `supabase/migrations/20251028_extend_conversations_for_personas.sql`
2. Copy the entire SQL content
3. Paste into Supabase SQL Editor
4. Click "Run" or press Ctrl/Cmd + Enter

### Step 3: Verify the Migration

Run this verification query:
```sql
-- Check if columns were added
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'conversations'
  AND column_name IN ('session_id', 'persona_id', 'is_guest_session', 'guest_message_count')
ORDER BY column_name;

-- Check if indexes were created
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'conversations'
  AND indexname IN ('idx_conversations_persona', 'idx_conversations_guest_session');

-- Check foreign key constraint
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'conversations'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'persona_id';
```

### Expected Results

**Columns Query:**
Should return 4 rows showing:
- session_id (text, YES, NULL)
- persona_id (uuid, YES, NULL)
- is_guest_session (boolean, YES, false)
- guest_message_count (integer, YES, 0)

**Indexes Query:**
Should return 2 rows:
- idx_conversations_persona
- idx_conversations_guest_session

**Foreign Key Query:**
Should return 1 row showing:
- persona_id references personas(id)

## Rollback (if needed)

If you need to rollback this migration:
```sql
-- Remove columns
ALTER TABLE conversations
  DROP COLUMN IF EXISTS guest_message_count,
  DROP COLUMN IF EXISTS is_guest_session,
  DROP COLUMN IF EXISTS persona_id,
  DROP COLUMN IF EXISTS session_id;

-- Indexes will be automatically dropped with columns
```

## Notes
- All columns are nullable for backward compatibility with existing conversations
- The `persona_id` foreign key uses ON DELETE default (no action) - conversations remain if persona is deleted
- Guest session tracking is optional - existing conversations will have `is_guest_session = false` by default
- The migration is idempotent - safe to run multiple times

## Next Steps After Migration
1. Verify migration success using queries above
2. Update application code to use new fields
3. Test guest session flow with 10-message limit
4. Test persona-based conversations

## Status
- [ ] Migration file created
- [ ] Migration executed in Supabase
- [ ] Verification queries run successfully
- [ ] TypeScript types updated
- [ ] Committed to git
