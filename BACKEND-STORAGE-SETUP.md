# Backend Storage Setup Guide

This guide explains how to set up backend storage with Supabase for the Future You application. With backend storage, your data will sync across all devices and persist permanently.

## What's Been Implemented

### 1. **Database Schema**
Three main tables have been created:
- `users` - Stores user profile data from Google sign-in
- `personas` - Stores custom AI personas
- `conversations` - Stores chat histories for each persona

### 2. **API Routes**
Created REST API endpoints for data synchronization:
- `POST /api/sync/user` - Sync user profile
- `GET /api/sync/user` - Fetch user profile
- `POST /api/sync/personas` - Batch sync personas
- `GET /api/sync/personas` - Fetch all personas
- `DELETE /api/sync/personas?id={id}` - Delete a persona
- `POST /api/sync/conversations` - Save conversation
- `GET /api/sync/conversations?personaId={id}` - Fetch conversation
- `DELETE /api/sync/conversations?personaId={id}` - Delete conversation

### 3. **Automatic Syncing**
- **Initial Sync**: When you sign in with Google, all your data syncs to backend
- **Auto-Sync**: Data syncs every 5 minutes while you're using the app
- **Real-Time Sync**: Conversations sync 2 seconds after each message
- **Fallback**: If backend is unavailable, everything still works with localStorage

### 4. **Cross-Device Support**
- Sign in on any device with the same Google account
- All personas and conversations automatically sync
- Continue chats from where you left off on any device

## Setup Instructions

### Step 1: Run Database Schema

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Sign in to your account
   - Select your project: `exdjsvknudvfkabnifrg`

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "+ New query"

3. **Run Schema SQL**
   - Open the file: `supabase-schema.sql` in the project root
   - Copy ALL the SQL code
   - Paste it into the SQL Editor
   - Click "Run" button at the bottom right

4. **Verify Tables Created**
   - Click "Table Editor" in the left sidebar
   - You should see 3 tables: `users`, `personas`, `conversations`

### Step 2: Verify Environment Variables

Your `.env.local` already has these configured:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://exdjsvknudvfkabnifrg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Test Locally

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Sign In with Google**
   - Visit http://localhost:3000
   - Click "Sign in with Google"
   - Complete authentication

3. **Verify Sync**
   - Open browser console (F12)
   - Look for these messages:
     ```
     ✅ Google user data saved automatically
     🔄 Starting initial sync with backend...
     ✅ User profile synced: created
     ✅ Personas synced: { created: 0, updated: 0, failed: 0 }
     ✅ Initial sync completed
     ```

4. **Create Test Data**
   - Create a new persona
   - Start a chat conversation
   - Send a few messages
   - Wait 2 seconds and check console for: `✅ Conversation synced for persona`

5. **Verify in Supabase**
   - Go to Supabase Dashboard → Table Editor
   - Check `users` table - your profile should be there
   - Check `personas` table - your persona should be there
   - Check `conversations` table - your chat should be there

### Step 4: Test Cross-Device Sync

1. **Device 1 (Create Data)**
   - Sign in with Google
   - Create 2-3 personas
   - Start conversations with them
   - Wait for auto-sync (or refresh page to trigger sync)

2. **Device 2 (Verify Sync)**
   - Sign in with the SAME Google account
   - You should see all personas immediately
   - Open a chat - conversation history should load
   - Send a new message
   - Check Device 1 - after auto-sync, new message should appear

### Step 5: Deploy to Production

1. **Ensure Vercel has Supabase env vars**
   ```bash
   vercel env ls production
   ```

   Should show:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_KEY

2. **Deploy**
   ```bash
   git add .
   git commit -m "Add backend storage with Supabase sync"
   git push
   ```

3. **Verify Production**
   - Visit https://future-you-six.vercel.app
   - Sign in with Google
   - Check browser console for sync messages
   - Verify data persists across sessions

## How It Works

### Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    User Actions                          │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│              localStorage (Immediate Save)               │
│  • Always works offline                                  │
│  • Instant response                                      │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│           Background Sync (If Google Signed In)          │
│  • User Profile: On sign-in                             │
│  • Personas: Every 5 minutes                            │
│  • Conversations: 2 seconds after last message          │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│                  Supabase Database                       │
│  • PostgreSQL with Row Level Security                   │
│  • Cross-device sync                                    │
│  • Automatic backups                                    │
└─────────────────────────────────────────────────────────┘
```

### Security

- **Row Level Security (RLS)**: Users can only access their own data
- **Authentication**: Protected by NextAuth + Google OAuth
- **API Routes**: All routes check authentication before accessing data
- **Service Role**: Only used in server-side API routes, never exposed to client

### Storage Locations

**localStorage (Client-Side)**
- Purpose: Fast access, offline support
- Keys:
  - `user_profile` - User profile data
  - `user_session` - Active session
  - `custom_personas` - All personas
  - `conversation_{personaId}` - Chat histories

**Supabase (Backend)**
- Purpose: Cross-device sync, permanent storage
- Tables:
  - `users` - User profiles indexed by google_id
  - `personas` - Personas linked to user_id
  - `conversations` - Chats linked to user_id and persona_id

## Troubleshooting

### Sync Not Working

1. **Check Authentication**
   - Console should show: `✅ Google user data saved automatically`
   - User profile should have `googleId` field

2. **Check API Routes**
   - Open Network tab in DevTools
   - Look for requests to `/api/sync/*`
   - Should return 200 status codes
   - If 401: Authentication issue
   - If 500: Database connection issue

3. **Check Supabase Connection**
   - Verify environment variables are set
   - Test direct connection:
     ```javascript
     // In browser console
     const { data, error } = await fetch('/api/sync/user').then(r => r.json())
     console.log(data, error)
     ```

4. **Check Database Tables**
   - Go to Supabase Dashboard → Table Editor
   - Verify tables exist: users, personas, conversations
   - Check if RLS policies are enabled

### Data Not Appearing on Second Device

1. **Wait for Auto-Sync**
   - Auto-sync runs every 5 minutes
   - Or refresh the page to trigger immediate sync

2. **Check Same Google Account**
   - Both devices must use the SAME Google account
   - Check user email in profile section

3. **Check Console Logs**
   - Device 1: Should show "✅ Personas synced"
   - Device 2: Should show "🔄 Starting initial sync"

### Guest Users

- Guest users (no Google sign-in) continue to work as before
- Data is stored ONLY in localStorage
- No cross-device sync available
- Data persists on the same device/browser

## Benefits

✅ **Cross-Device Sync** - Access your personas and chats from any device
✅ **Permanent Storage** - Data never lost, even if you clear browser
✅ **Automatic Backups** - Supabase handles backups automatically
✅ **Offline Support** - localStorage still works when backend is unavailable
✅ **No Breaking Changes** - Existing users' data preserved
✅ **Privacy** - Your data is never shared, RLS ensures only you can access it

## Files Modified

- `supabase-schema.sql` - Database schema
- `src/lib/supabase.ts` - Supabase client configuration
- `src/types/supabase.ts` - TypeScript types for database
- `src/lib/utils/sync.ts` - Sync utility functions
- `src/app/api/sync/user/route.ts` - User sync API
- `src/app/api/sync/personas/route.ts` - Personas sync API
- `src/app/api/sync/conversations/route.ts` - Conversations sync API
- `src/app/personas/page.tsx` - Added auto-sync on personas page
- `src/components/chat/ChatInterface.tsx` - Added conversation sync in chat

---

**Status**: Ready for testing and deployment
**Next Steps**: Run database schema in Supabase, test locally, then deploy to production
