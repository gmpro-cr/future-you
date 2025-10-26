# Celebrity Persona Visibility Fix

## Issues Identified

1. **Celebrity personas not visible to all users**: The `getAllPersonas()` function was filtering personas by `session_identifier`, which excluded public celebrity personas
2. **Delete/Edit buttons showing for celebrity personas**: Users could see edit and delete options for public personas they shouldn't be able to modify

## Fixes Applied

### 1. Fixed `src/lib/api/supabase.ts` - `getAllPersonas()` function
**Before:**
```typescript
if (sessionIdentifier) {
  query = query.eq('session_identifier', sessionIdentifier);  // Only user personas
}
```

**After:**
```typescript
if (sessionIdentifier) {
  // Return BOTH user-specific personas AND public celebrity personas
  query = query.or(`session_identifier.eq.${sessionIdentifier},is_public.eq.true`);
} else {
  // If no session identifier, only return public personas
  query = query.eq('is_public', true);
}
```

### 2. Added `isPublic` field to Persona type (`src/types/index.ts`)
```typescript
export interface Persona {
  id: string;
  name: string;
  description?: string;
  systemPrompt: string;
  emoji?: string;
  avatarUrl?: string;
  createdAt: string;
  isPublic?: boolean;  // True for celebrity/system personas visible to all users
}
```

### 3. Updated API route (`src/app/api/personas/route.ts`)
Added `isPublic` field to the API response:
```typescript
const transformedPersonas = personas.map((p: any) => ({
  id: p.id,
  name: p.name,
  description: p.description,
  systemPrompt: p.system_prompt,
  emoji: p.emoji,
  type: p.type,
  createdAt: p.created_at,
  isPublic: p.is_public || false,  // Include isPublic flag for celebrity personas
}));
```

### 4. Updated PersonaCard component (`src/components/persona/PersonaCard.tsx`)
Hide Edit/Delete buttons for public personas:
```typescript
{/* Only show Edit/Delete for user-created personas, not for celebrity/public personas */}
{onEdit && !persona.isPublic && (
  <button>...</button>
)}
{onDelete && !persona.isPublic && (
  <button>...</button>
)}
```

## Next Steps: Run Celebrity Personas Migration

The 10 celebrity personas need to be added to the production database:

### Celebrity Personas to be Added:
1. **Virat Kohli** - Cricket legend and former captain
2. **Shah Rukh Khan** - Bollywood superstar (King Khan)
3. **Narendra Modi** - Prime Minister of India
4. **Shraddha Kapoor** - Relatable Bollywood star
5. **Priyanka Chopra** - Confident, cosmopolitan actress
6. **Alia Bhatt** - Spontaneous and cheerful actress
7. **Deepika Padukone** - Calm and emotionally honest actress
8. **Katrina Kaif** - Reserved and graceful actress
9. **Allu Arjun** - Charismatic Telugu cinema star
10. **MS Dhoni** - Humble cricket captain (Captain Cool)

### Option 1: Run Migration Script (Recommended)
```bash
cd /Users/gaurav/Esperit
node future-you/scripts/add-celebrity-personas.js
```

This script will:
- Read the SQL migration file
- Execute it against your Supabase database
- Verify all 10 celebrity personas were added

### Option 2: Manual SQL Execution
1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to SQL Editor
3. Copy the contents of `future-you/supabase/migrations/seed/20250125000000_add_celebrity_personas.sql`
4. Paste and run the SQL

### Verify Migration Success
After running the migration, verify with:
```bash
node verify-setup.js
```

Or manually check in Supabase:
```sql
SELECT id, name, is_public FROM personas WHERE is_public = true;
```

You should see all 10 celebrity personas listed.

## Testing

After the migration:

1. **Visit the website**: https://future-you-six.vercel.app/
2. **Sign in as Guest**
3. **Check Persona Page**: You should now see 10 celebrity personas + your custom ones
4. **Verify no Edit/Delete buttons** on celebrity personas
5. **Verify Edit/Delete buttons appear** only on your custom personas
6. **Test Chat**: Click on a celebrity persona and start chatting

## Files Modified

- ✅ `src/lib/api/supabase.ts` - Fixed getAllPersonas() query
- ✅ `src/types/index.ts` - Added isPublic field
- ✅ `src/app/api/personas/route.ts` - Include isPublic in API response
- ✅ `src/components/persona/PersonaCard.tsx` - Conditional Edit/Delete buttons

## Migration File Location

`future-you/supabase/migrations/seed/20250125000000_add_celebrity_personas.sql`
