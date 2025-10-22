# Fix: Custom Personas Not Responding

## Problem Summary
Your custom personas are created successfully but chats are not working. You're getting a database constraint error:

```
null value in column "persona_type" of relation "conversations" violates not-null constraint
```

## Root Cause
The database schema was designed for the old system with predefined personas. The `conversations` table has a `persona_type` column marked as `NOT NULL` (see `src/lib/db/schema.sql:39`), but the new custom persona system doesn't use this field the same way.

## The Fix (Required)

You **MUST** run this SQL in your Supabase database to make custom personas work:

### Step-by-Step Instructions:

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg/sql
   - Or: Open your Supabase Dashboard → SQL Editor

2. **Copy and paste this SQL:**
   ```sql
   -- Make persona_type nullable to support custom personas
   ALTER TABLE conversations
   ALTER COLUMN persona_type DROP NOT NULL;

   -- Set default value for new conversations
   ALTER TABLE conversations
   ALTER COLUMN persona_type SET DEFAULT 'custom';

   -- Update any existing conversations with NULL values
   UPDATE conversations
   SET persona_type = 'custom'
   WHERE persona_type IS NULL;
   ```

3. **Click "Run"** (or press Cmd/Ctrl + Enter)

4. **Verify Success**
   - You should see: "Success. No rows returned"
   - This is normal for ALTER TABLE commands

5. **Test Your Personas**
   - Go back to your app: http://localhost:3000
   - Click on any custom persona
   - Try sending a message
   - It should now work!

## What This Changes

**Before:**
- Database required `persona_type` to always have a value
- Code tried to provide 'custom' but constraint was blocking it

**After:**
- Database allows `persona_type` to be NULL if needed
- Default value of 'custom' is set for new conversations
- Custom personas can now create conversations successfully

## Files Already Updated

The following code files have been updated and are ready:

✅ `/src/lib/api/supabase.ts` - createConversation provides default 'custom' value
✅ `/src/app/api/chat/route.ts` - Chat API passes personaId and personaPrompt
✅ `/src/lib/utils/validators.ts` - Schema validates personaId and personaPrompt
✅ `/src/hooks/useChat.ts` - Chat hook sends persona data to API
✅ `/supabase/migrations/20250122000000_make_persona_type_nullable.sql` - Migration file created

## Alternative: Use Migration Script

Instead of manually copying SQL, you can run:

```bash
node run-migration.js
```

This will:
- Test your Supabase connection
- Show you the SQL to run
- Provide the direct link to your SQL Editor

## Verification

After running the SQL migration, you can verify it worked by:

1. Checking the dev server terminal - no more 23502 errors
2. Creating a test persona and sending a message
3. Checking browser console - should see successful API responses
4. Checking Supabase logs - conversations table should show new rows

## Need Help?

If you encounter issues:

1. Check your Supabase dashboard for error logs
2. Verify you're connected to the correct project
3. Make sure you have admin/owner permissions
4. See `DATABASE-FIX.md` for more detailed troubleshooting

## Migration File Location

The SQL migration is saved at:
`supabase/migrations/20250122000000_make_persona_type_nullable.sql`

This can be used with Supabase CLI or version control for future deployments.

---

**Status:** ⚠️ Waiting for you to run the SQL migration in Supabase

**Next Step:** Open Supabase SQL Editor and run the ALTER TABLE commands above
