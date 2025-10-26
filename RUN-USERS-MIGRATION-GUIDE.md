# Users Table Migration Guide

## Issue Summary
The database is missing the `users` table and the `personas` table is missing columns (`is_public`, `session_identifier`, `user_id`), causing runtime sync errors when users sign in with Google.

**Error in Console:**
```
POST /api/sync/user 500 (Internal Server Error)
```

## Solution
Run the migration `supabase/migrations/20251026000000_add_users_table_and_update_personas.sql` manually through Supabase SQL Editor.

## Steps to Run Migration

### Option 1: Supabase Dashboard (Recommended)

1. **Go to Supabase SQL Editor**
   - Visit: https://supabase.com/dashboard
   - Select your project: `exdjsvknudvfkabnifrg`
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

2. **Copy Migration SQL**
   - Open file: `supabase/migrations/20251026000000_add_users_table_and_update_personas.sql`
   - Copy the entire contents

3. **Paste and Run**
   - Paste the SQL into the editor
   - Click "Run" button
   - Wait for success message

4. **Verify Success**
   - You should see: "Success. No rows returned"
   - Check that no errors appear

### Option 2: Command Line (using Supabase CLI)

If you have Supabase CLI installed:

```bash
cd /Users/gaurav/Esperit
supabase db push
```

This will apply all pending migrations from the `supabase/migrations/` directory.

## Verification

After running the migration, verify the changes:

### 1. Check Users Table Exists
```sql
SELECT * FROM users LIMIT 1;
```
Should return: "No rows found" (table exists but empty)

### 2. Check Personas Table Has New Columns
```sql
SELECT id, name, is_public, session_identifier, user_id 
FROM personas 
LIMIT 5;
```
Should return: Celebrity personas with `is_public = true` and `NULL` for `session_identifier` and `user_id`

### 3. Test User Sync
1. Open https://future-you-six.vercel.app/
2. Sign in with Google
3. Open browser DevTools Console
4. Should see: `✅ User profile synced successfully` (not 500 error)

## What This Migration Does

### 1. Creates Users Table
- Stores authenticated Google user profiles
- Fields: `google_id`, `email`, `name`, `image`, `locale`, `email_verified`, `birthdate`, `country`, `profession`
- Enables user data persistence and sync

### 2. Updates Personas Table
- Adds `is_public` (boolean) - marks celebrity personas visible to all users
- Adds `session_identifier` (text) - links guest user personas to sessions
- Adds `user_id` (UUID) - links authenticated user personas to users table

### 3. Creates Indexes
- Performance optimization for user lookups and persona queries

### 4. Enables Row Level Security
- Adds RLS policies for users and personas tables
- Uses permissive policies for MVP (can be tightened later)

## Expected Results

**Before Migration:**
- ❌ Users table: Does not exist
- ❌ Personas columns: Missing `is_public`, `session_identifier`, `user_id`
- ❌ User sync: 500 error on Google sign-in
- ❌ Celebrity personas: Not visible to all users

**After Migration:**
- ✅ Users table: Created and ready
- ✅ Personas columns: All new columns added
- ✅ User sync: Works correctly
- ✅ Celebrity personas: Visible to all users globally

## Files Involved

1. **Migration File:**
   - `supabase/migrations/20251026000000_add_users_table_and_update_personas.sql`

2. **Updated Schema:**
   - `src/lib/db/schema.sql` (for reference, already updated)

3. **Sync Endpoints:**
   - `src/app/api/sync/user/route.ts` (will work after migration)
   - `src/lib/utils/sync.ts` (will work after migration)

## Troubleshooting

### Error: "relation 'users' already exists"
This means the migration already ran successfully. You can skip this step.

### Error: "column already exists"
Some columns may already exist. This is fine - the migration uses `IF NOT EXISTS` to handle this.

### Error: "permission denied"
Make sure you're using the service role key (not anon key) when running migrations.

## Next Steps After Migration

1. ✅ Mark Fix #2 as complete
2. ⏩ Move to Fix #3: Fix critical TypeScript errors
3. ⏩ Continue systematic debugging process
