# Backend Data Sync Fix Guide

## 🔍 Current Situation

### What I Found

Your **Future You** app has **two different database schemas**:

**1. Current Supabase Database (OLD):**
- ❌ **NO `users` table** - Google Sign-In data has nowhere to go!
- ✅ `personas` table - but only stores default personas (Entrepreneur, Mindful, etc.)
- ✅ `conversations` table - but uses `session_id` instead of `user_id`

**2. Code Expects (NEW Schema in `supabase-schema.sql`):**
- ✅ `users` table - for Google user data
- ✅ `personas` table - with `user_id` to link personas to users
- ✅ `conversations` table - with `user_id` and `persona_id` to link conversations

### The Problem

When someone signs in with Google:
1. ✅ Frontend saves data to localStorage
2. ✅ Sync API is called (`/api/sync/user`)
3. ❌ **API FAILS** because `users` table doesn't exist
4. ❌ **User data is NOT saved** to Supabase
5. ❌ **Personas are NOT persisted** across devices

## 📊 Data Flow Analysis

### Current Flow (BROKEN)

```
Google Sign-In
    ↓
NextAuth Session Created ✅
    ↓
localStorage Updated ✅
    ↓
performCompleteSync() called
    ↓
POST /api/sync/user
    ↓
❌ ERROR: "Could not find the table 'public.users' in the schema cache"
    ↓
User data lost in Supabase
```

### Expected Flow (AFTER FIX)

```
Google Sign-In
    ↓
NextAuth Session Created ✅
    ↓
localStorage Updated ✅
    ↓
performCompleteSync() called
    ↓
POST /api/sync/user ✅
    ↓
User saved to Supabase ✅
    ↓
Personas synced ✅
    ↓
Conversations synced ✅
    ↓
Data accessible across devices ✅
```

## 🛠️ How to Fix

### Option 1: Apply Migration (RECOMMENDED)

This preserves your existing personas and conversations while adding user support.

**Steps:**

1. **Open Supabase SQL Editor**
   ```
   https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg/editor
   ```

2. **Copy and paste the contents of:**
   ```
   migration-add-users-support.sql
   ```

3. **Click "Run"**

4. **Verify tables were created:**
   ```bash
   node check-tables.js
   ```

   Expected output:
   ```
   ✅ users: 0 records (newly created, waiting for sign-ins)
   ✅ personas: 7 records (existing default personas)
   ✅ conversations: 0 records (new table, old data in conversations_old)
   ```

### Option 2: Fresh Start (CLEAN SLATE)

If you don't need the existing data:

1. **Open Supabase SQL Editor**

2. **Drop existing tables:**
   ```sql
   DROP TABLE IF EXISTS conversations CASCADE;
   DROP TABLE IF EXISTS personas CASCADE;
   DROP TABLE IF EXISTS users CASCADE;
   ```

3. **Apply the full schema:**
   - Copy contents of `supabase-schema.sql`
   - Paste into SQL Editor
   - Click "Run"

## 🧪 Testing After Fix

### 1. Verify Tables Exist

```bash
node check-tables.js
```

Expected output:
```
✅ users: X records
✅ personas: X records
✅ conversations: X records
```

### 2. Test Google Sign-In

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Visit:** http://localhost:3000

3. **Click "Sign in with Google"**

4. **Watch browser console for:**
   ```
   ✅ Google user data saved automatically
   🔄 Starting initial sync with backend...
   ✅ Initial sync completed: {userSynced: true, personasSynced: true}
   ```

### 3. Verify Data in Supabase

```bash
node test-supabase-data.js
```

Expected output after sign-in:
```
📊 USERS TABLE
✅ Total users: 1

👥 User Data:
  User 1:
    Name: Your Name
    Email: your@email.com
    Google ID: 123...
    Created: Just now
```

### 4. Test Persona Creation

1. **Create a new persona** in the app
2. **Check Supabase:**
   ```bash
   node test-supabase-data.js
   ```
3. **Verify persona shows up with your user_id**

### 5. Test Conversation Sync

1. **Start a chat** with a persona
2. **Send a few messages**
3. **Check Supabase:**
   ```bash
   node test-supabase-data.js
   ```
4. **Verify conversation is saved with messages**

## 📋 What Gets Synced

### User Data (from Google Sign-In)
- ✅ Name
- ✅ Email
- ✅ Profile picture URL
- ✅ Google User ID
- ✅ Locale (language/region)
- ✅ Email verified status

### Personas
- ✅ Name
- ✅ Description
- ✅ System prompt
- ✅ Emoji
- ✅ Avatar URL
- ✅ User ownership (user_id)

### Conversations
- ✅ User ID
- ✅ Persona ID
- ✅ All messages (as JSONB array)
- ✅ Timestamps

## 🔄 Auto-Sync Behavior

After Google Sign-In, data syncs:
- ✅ **Immediately** after sign-in
- ✅ **Every 5 minutes** while app is open
- ✅ **When creating** a new persona
- ✅ **When deleting** a persona
- ✅ **When sending** messages (conversation updates)

## 🐛 Troubleshooting

### "Could not find the table 'public.users'"
- **Cause:** Migration not applied
- **Fix:** Run `migration-add-users-support.sql` in Supabase SQL Editor

### "User not found" error in sync
- **Cause:** User wasn't created in database
- **Fix:** Check if users table exists, try signing out and back in

### Personas not showing user_id
- **Cause:** Created before migration
- **Fix:** These are default personas (OK to have NULL user_id)

### Conversations not syncing
- **Cause:** New conversations table doesn't have old data
- **Fix:** Normal - new conversations will sync to new table

## 📁 Files Created

1. **`migration-add-users-support.sql`** - Database migration script
2. **`check-tables.js`** - Quick table existence check
3. **`test-supabase-data.js`** - Comprehensive data verification
4. **`inspect-schema.js`** - Schema structure inspector
5. **`BACKEND-DATA-SYNC-FIX.md`** - This guide

## ✅ Success Criteria

After applying the fix, you should see:

1. ✅ `users` table exists in Supabase
2. ✅ Google Sign-In creates user records
3. ✅ Custom personas are linked to users
4. ✅ Conversations are linked to users and personas
5. ✅ Data persists across devices
6. ✅ Auto-sync works every 5 minutes
7. ✅ No console errors in browser

## 🎯 Next Steps

1. **Apply migration:** Run `migration-add-users-support.sql`
2. **Test sign-in:** Sign in with Google
3. **Verify sync:** Check console for sync success messages
4. **Create persona:** Make a new persona and verify it's saved
5. **Test chat:** Start a conversation and verify it's saved
6. **Check Supabase:** Run `node test-supabase-data.js`

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Run `node test-supabase-data.js` to diagnose
3. Verify environment variables in `.env.local`
4. Check Supabase dashboard for table structure

---

**Status:** 🔴 Database migration required
**Impact:** Google Sign-In data not persisting to Supabase
**Priority:** High - user data is only stored in localStorage
**Estimated Fix Time:** 5 minutes (just run the SQL migration)
