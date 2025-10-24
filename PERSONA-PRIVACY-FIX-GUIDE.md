# Persona Privacy Fix - Deployment Guide

## Issues Fixed

### Issue #1: All Users Seeing Everyone's Personas ✅
**Root Cause:** `getAllPersonas()` fetched ALL personas without user filtering
**Fix:** Added `session_identifier` column to filter personas by user session

### Issue #2: Chat Functionality
**Status:** Will test after deploying Issue #1 fix

## Deployment Steps

### Step 1: Run SQL Migration in Supabase

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to SQL Editor
4. Copy and paste the contents of `fix-personas-privacy.sql`
5. Click "Run" to execute the migration

**What it does:**
- Adds `session_identifier` column to `personas` table
- Creates index for better query performance
- Allows filtering personas by user session (guest or Google)

### Step 2: Deploy Code Changes

The following files have been updated:
- ✅ `src/lib/api/supabase.ts` - Added session filtering
- ✅ `src/app/api/personas/route.ts` - Pass session ID to queries
- ✅ `src/lib/utils/personas.ts` - Send session ID from frontend

### Step 3: Verify Fix

After deployment:
1. Open incognito window
2. Go to https://future-you-six.vercel.app
3. Continue as Guest
4. Create a persona
5. Verify ONLY your persona appears (not others)
6. Open second incognito window
7. Create another persona as different guest
8. Verify each user only sees their own personas

## Technical Details

**How It Works:**
- Guest users: `sessionId` = "guest_timestamp"
- Google users: `sessionId` = Google ID
- Personas are filtered by `session_identifier` column
- Each user only sees their own personas

**Database Schema:**
```sql
ALTER TABLE personas
  ADD COLUMN session_identifier TEXT;
```

**Privacy Guarantee:**
- Users can ONLY see personas with matching `session_identifier`
- Old personas without `session_identifier` won't appear (privacy-first)
- Each session is isolated

## Next Steps

After verifying Issue #1 is fixed:
1. Test chat functionality
2. Check for any console errors
3. Verify persona selection works
4. Test message sending/receiving

---

**Files to Deploy:**
- `src/lib/api/supabase.ts`
- `src/app/api/personas/route.ts`
- `src/lib/utils/personas.ts`

**SQL Migration:**
- `fix-personas-privacy.sql` (run in Supabase SQL Editor)
