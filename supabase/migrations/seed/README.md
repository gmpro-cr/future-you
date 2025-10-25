# Celebrity Personas Migration

This directory contains the migration to add celebrity personas that are visible to all users of the application.

## What This Migration Does

The `20250125000000_add_celebrity_personas.sql` migration adds **10 celebrity personas** with complete system prompts to the database:

1. **Virat Kohli** - Indian cricket legend
2. **Shah Rukh Khan** - Bollywood superstar (King Khan)
3. **Narendra Modi** - Prime Minister of India
4. **Shraddha Kapoor** - Relatable Bollywood star
5. **Priyanka Chopra** - Global icon and actress
6. **Alia Bhatt** - Cheerful Bollywood actress
7. **Deepika Padukone** - Dignified and emotionally honest star
8. **Katrina Kaif** - Reserved and graceful actress
9. **Allu Arjun** - Telugu cinema legend
10. **MS Dhoni** - Legendary cricket captain (Captain Cool)

Each persona includes:
- Name and description
- Complete system prompt defining personality and communication style
- Public visibility flag (`is_public = true`)
- NULL user_id (making them available to everyone)

## How to Execute This Migration

### Option 1: Using the Automated Script (Recommended)

Run the provided Node.js script from the project root:

```bash
node scripts/add-celebrity-personas.js
```

This script will:
- Read the migration SQL file
- Execute each SQL statement
- Verify that the personas were added successfully
- Display a list of all public personas

**Requirements:**
- Node.js installed
- Environment variables set:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

### Option 2: Manual Execution via Supabase Dashboard

1. Go to your [Supabase project dashboard](https://app.supabase.com)
2. Navigate to **SQL Editor** in the left sidebar
3. Click "New Query"
4. Copy the entire contents of `20250125000000_add_celebrity_personas.sql`
5. Paste into the SQL editor
6. Click **Run** or press Ctrl+Enter
7. Verify success by checking the `personas` table

### Option 3: Using Supabase CLI

If you have Supabase CLI installed:

```bash
supabase db push
```

Or manually apply the migration:

```bash
supabase db execute < supabase/migrations/seed/20250125000000_add_celebrity_personas.sql
```

## Verification

After running the migration, verify that the personas were added:

### Via SQL Query:
```sql
SELECT id, name, is_public 
FROM personas 
WHERE is_public = true;
```

You should see all 10 celebrity personas listed.

### Via Application:
1. Navigate to the personas page on your website
2. You should see all 10 celebrity personas available to select
3. Click on any persona to start chatting with their AI representation

## Database Schema Changes

This migration makes the following schema modifications:

1. **Adds `is_public` column** to the `personas` table (BOOLEAN, default FALSE)
2. **Makes `user_id` nullable** (allows public personas with NULL user_id)
3. **Creates index** on `is_public` for faster queries
4. **Updates RLS policy** to allow everyone to read public personas

## Rollback

If you need to remove the celebrity personas:

```sql
DELETE FROM personas WHERE is_public = true AND user_id IS NULL;
```

## Troubleshooting

### Issue: "No personas visible on website"
- Ensure the migration was executed successfully
- Check that the RLS policy was created
- Verify the frontend is querying for `is_public = true` personas

### Issue: "Permission denied"
- Ensure you're using the service role key (not anon key)
- Check that RLS policies are correctly configured

### Issue: "Column already exists"
- The migration uses `IF NOT EXISTS` and `ON CONFLICT` clauses
- Safe to run multiple times
- If issues persist, check existing schema

## Support

For issues or questions:
1. Check the main project README
2. Review Supabase documentation
3. Open an issue in the repository

---

**Note:** This migration is designed to be idempotent (safe to run multiple times) using `IF NOT EXISTS` and `ON CONFLICT` clauses.
