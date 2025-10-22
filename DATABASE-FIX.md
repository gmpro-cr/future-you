# Database Fix for Custom Personas

## Problem
The `conversations` table has a `persona_type` column with a NOT NULL constraint, which is causing errors when creating conversations with custom personas.

Error: `null value in column "persona_type" of relation "conversations" violates not-null constraint`

## Solution
Run the migration to make the `persona_type` column nullable and set a default value.

## How to Apply the Fix

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `supabase/migrations/20250122000000_make_persona_type_nullable.sql`
5. Click **Run** to execute the migration

### Option 2: Using Supabase CLI
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (you'll need your project ref)
supabase link --project-ref your-project-ref

# Push the migration
supabase db push
```

### Option 3: Run SQL Directly
Open your Supabase SQL Editor and run:

```sql
-- Make persona_type nullable
ALTER TABLE conversations
ALTER COLUMN persona_type DROP NOT NULL;

-- Set default value
ALTER TABLE conversations
ALTER COLUMN persona_type SET DEFAULT 'custom';

-- Fix any existing null values
UPDATE conversations
SET persona_type = 'custom'
WHERE persona_type IS NULL;
```

## Verify the Fix
After running the migration, try creating a custom persona and chatting with it. The chat should now work without errors.

## What Changed
- `persona_type` column is now nullable (allows NULL values)
- Default value is set to 'custom' for new conversations
- Existing conversations with NULL values are updated to 'custom'

This allows the application to work with custom personas stored in localStorage while maintaining backward compatibility with the database schema.
