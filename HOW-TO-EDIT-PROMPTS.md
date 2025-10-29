# How to Edit Persona Prompts

**Last Updated:** October 30, 2025
**Personas:** 49
**Storage:** Supabase PostgreSQL Database

---

## 📋 Table of Contents

1. [Quick Start (Recommended)](#quick-start-recommended)
2. [Method 1: Bulk Edit via Script](#method-1-bulk-edit-via-script)
3. [Method 2: Edit via Supabase Dashboard](#method-2-edit-via-supabase-dashboard)
4. [Method 3: Single Prompt Update](#method-3-single-prompt-update)
5. [Method 4: SQL Direct Update](#method-4-sql-direct-update)
6. [Prompt Guidelines](#prompt-guidelines)
7. [Testing Your Changes](#testing-your-changes)

---

## Quick Start (Recommended)

**Best for:** Editing multiple prompts at once

```bash
# 1. Export all prompts to a JSON file
node scripts/edit-persona-prompts.js export

# 2. Open persona-prompts-export.json in your editor (VS Code, etc.)

# 3. Edit the "system_prompt" field for any persona

# 4. Save the file

# 5. Import your changes back to the database
node scripts/edit-persona-prompts.js import
```

That's it! All your changes are now live.

---

## Method 1: Bulk Edit via Script

### Step 1: Export All Prompts

```bash
node scripts/edit-persona-prompts.js export
```

**Output:**
```
📥 Exporting persona prompts...

✅ Exported 49 persona prompts to: persona-prompts-export.json

📝 To edit:
   1. Open persona-prompts-export.json in your editor
   2. Edit the "system_prompt" field for any persona
   3. Save the file
   4. Run: node scripts/edit-persona-prompts.js import
```

**This creates:** `persona-prompts-export.json`

### Step 2: Edit the JSON File

Open `persona-prompts-export.json` in your favorite editor:

```json
{
  "exported_at": "2025-10-30T01:45:00.000Z",
  "total_personas": 49,
  "instructions": "Edit the system_prompt field for each persona...",
  "personas": [
    {
      "id": "a584436f-437e-4d1f-9829-92863d671385",
      "name": "Ratan Tata",
      "category": "business",
      "system_prompt": "You are Ratan Tata, Industrialist & Philanthropist.\n\nBIOGRAPHY:\n..."
    },
    ...
  ]
}
```

**Edit the `system_prompt` field:**
- Change text
- Add more personality
- Update biography
- Modify response guidelines
- Add Hinglish patterns

### Step 3: Import Your Changes

```bash
node scripts/edit-persona-prompts.js import
```

**Output:**
```
📤 Importing edited prompts...

✅ Updated: Ratan Tata
✅ Updated: Narayana Murthy
✅ Updated: Mukesh Ambani
...

📊 Results:
   ✅ Updated: 49
   ❌ Errors: 0
   📝 Total: 49
```

**Done!** All prompts are now updated in the database.

---

## Method 2: Edit via Supabase Dashboard

**Best for:** Editing 1-2 prompts manually

### Steps:

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Login with your account

2. **Select Your Project**
   - Click on your project

3. **Open Table Editor**
   - Click "Table Editor" in left sidebar
   - Click "personas" table

4. **Find the Persona**
   - Scroll or use search to find persona
   - Or use filters: `category` = `business`

5. **Edit the Prompt**
   - Click on the `system_prompt` cell
   - Edit the text in the popup
   - Click "Save" or press Ctrl+Enter

6. **Verify Changes**
   - Refresh the page
   - Check the updated prompt

**Pros:**
- Visual interface
- No coding required
- Easy to understand

**Cons:**
- Tedious for editing many prompts
- Limited search/replace
- No backup created automatically

---

## Method 3: Single Prompt Update

**Best for:** Quick update to one specific persona

### Via Script:

```bash
node scripts/edit-persona-prompts.js update "Ratan Tata" "Your new prompt here"
```

### Via Node.js:

Create a file `update-single.js`:

```javascript
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function updatePrompt() {
  const newPrompt = `
You are Ratan Tata, Industrialist & Philanthropist.

[Your updated prompt here...]
  `;

  const { error } = await supabase
    .from('personas')
    .update({ system_prompt: newPrompt.trim() })
    .eq('name', 'Ratan Tata');

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('✅ Updated successfully');
  }
}

updatePrompt();
```

Run:
```bash
node update-single.js
```

---

## Method 4: SQL Direct Update

**Best for:** Advanced users, pattern-based updates

### Via Supabase SQL Editor:

1. Go to Supabase Dashboard → SQL Editor
2. Create new query
3. Run SQL:

**Update single persona:**
```sql
UPDATE personas
SET system_prompt = 'Your new prompt here'
WHERE name = 'Ratan Tata';
```

**Update multiple personas in a category:**
```sql
UPDATE personas
SET system_prompt = REPLACE(
  system_prompt,
  'old text',
  'new text'
)
WHERE category = 'business';
```

**Add text to all prompts:**
```sql
UPDATE personas
SET system_prompt = system_prompt || '\n\nADDITIONAL GUIDELINES:\n- Be more engaging\n- Use emojis sparingly'
WHERE TRUE;
```

**Backup before updating:**
```sql
-- First, backup
CREATE TABLE personas_backup AS SELECT * FROM personas;

-- Then update
UPDATE personas SET system_prompt = '...' WHERE ...;

-- If something goes wrong, restore:
-- UPDATE personas SET system_prompt = personas_backup.system_prompt
-- FROM personas_backup WHERE personas.id = personas_backup.id;
```

---

## Prompt Guidelines

### Template Structure

Each prompt should follow this structure:

```
You are [Name], [Role/Title].

BIOGRAPHY:
[300-500 word biography - factual, engaging, highlights key achievements]

PERSONALITY TRAITS:
[5-6 keywords separated by commas: humble, visionary, ethical, compassionate, thoughtful]

COMMUNICATION STYLE:
- Use Hinglish naturally when appropriate
- Reference your real experiences and achievements
- Maintain authenticity to your public persona
- Be warm and culturally aware of Indian context

KNOWLEDGE AREAS:
[3-5 domains: business_strategy, ethics, philanthropy, innovation, leadership]

RESPONSE GUIDELINES:
1. Stay in character consistently
2. Draw from known history and achievements
3. Be [personality-specific: inspiring/humble/funny/serious]
4. Use culturally relevant examples
5. Code-switch between English and Hindi naturally
6. Reference Indian festivals/traditions when relevant
7. Acknowledge limitations outside expertise
8. Maintain appropriate formality level

LANGUAGE NOTES:
- Natural Hindi words: "Bahut important hai", "Sacchi mein", "Acha"
- Hinglish patterns: "Yaar", "Bas", "Theek hai", "Chalo"
- Mix English and Hindi in same sentence naturally
```

### Best Practices:

✅ **Do:**
- Keep prompts 2000-2500 characters (optimal length)
- Be specific about personality and tone
- Include real biographical facts
- Add Hinglish examples for natural code-switching
- Specify knowledge areas clearly
- Define response style and formality

❌ **Don't:**
- Make prompts too long (>3000 chars = slower responses)
- Be vague about personality
- Include fictional information
- Ignore cultural context
- Make prompts too restrictive
- Use overly formal or robotic language

### Hinglish Guidelines:

Good Hinglish integration:
```
"Yaar, business mein ethics bahut important hai. Maine hamesha believe kiya hai
that long-term success comes from doing the right thing."
```

Poor Hinglish:
```
"Dear friend, in business ethics is very important."  # Too formal, no Hindi
"बिजनेस में एथिक्स बहुत इम्पोर्टेंट है।"  # All Hindi, not code-switching
```

### Prompt Length Guidelines:

- **Minimum:** 1500 characters (too short = generic responses)
- **Optimal:** 2000-2500 characters (best balance)
- **Maximum:** 3000 characters (longer = slower API calls)

---

## Testing Your Changes

### Test in Browser:

1. **Start Dev Server:**
   ```bash
   npm run dev
   ```

2. **Navigate to Persona:**
   ```
   http://localhost:3000/personas
   ```

3. **Click on edited persona**

4. **Start a conversation**
   - Send test message
   - Check if AI responds in character
   - Verify personality traits show through
   - Check Hinglish code-switching

5. **Test different scenarios:**
   - Ask about expertise area
   - Ask about personal life
   - Ask technical questions
   - Try casual conversation

### Test via API:

```bash
# Get updated prompt
curl -s http://localhost:3000/api/personas | \
  jq '.data.personas[] | select(.name == "Ratan Tata") | .system_prompt'
```

### Test in Supabase:

```sql
SELECT name, LENGTH(system_prompt) as prompt_length
FROM personas
WHERE name = 'Ratan Tata';
```

---

## Backup & Restore

### Create Backup:

```bash
# Export current state
node scripts/edit-persona-prompts.js export

# Rename with timestamp
mv persona-prompts-export.json persona-prompts-backup-$(date +%Y%m%d).json
```

### Restore from Backup:

```bash
# Copy backup to export file
cp persona-prompts-backup-20251030.json persona-prompts-export.json

# Import
node scripts/edit-persona-prompts.js import
```

### Via Supabase:

```sql
-- Backup table
CREATE TABLE personas_backup_20251030 AS
SELECT * FROM personas;

-- Restore
UPDATE personas p
SET system_prompt = b.system_prompt
FROM personas_backup_20251030 b
WHERE p.id = b.id;
```

---

## Common Editing Tasks

### Add Hinglish to All Prompts:

```bash
# Export
node scripts/edit-persona-prompts.js export

# Use find & replace in your editor:
# Find: "LANGUAGE NOTES:"
# Replace with: "LANGUAGE NOTES:\n- Use more Hinglish naturally\n"

# Import
node scripts/edit-persona-prompts.js import
```

### Make All Prompts More Casual:

In SQL Editor:
```sql
UPDATE personas
SET system_prompt = REPLACE(
  system_prompt,
  'Maintain formal tone',
  'Maintain friendly, casual tone'
);
```

### Update All Prompts in Category:

```bash
# Export
node scripts/edit-persona-prompts.js export

# In your editor, filter by category and edit
# Or use jq:
jq '.personas |= map(
  if .category == "business"
  then .system_prompt = (.system_prompt + "\n\nFocus on Indian business context.")
  else .
  end
)' persona-prompts-export.json > temp.json

mv temp.json persona-prompts-export.json

# Import
node scripts/edit-persona-prompts.js import
```

---

## Troubleshooting

### Error: "File not found"

**Solution:**
```bash
# Make sure you're in the right directory
pwd
# Should show: /Users/gaurav/Esperit/.worktrees/persona-platform

# Run export first
node scripts/edit-persona-prompts.js export
```

### Error: "Invalid JSON"

**Problem:** JSON syntax error in edited file

**Solution:**
1. Use a JSON validator: https://jsonlint.com/
2. Check for:
   - Missing commas
   - Unescaped quotes in text
   - Missing brackets
3. Restore from backup if needed

### Prompt Not Updating:

**Solutions:**
1. Clear browser cache
2. Restart dev server
3. Check Supabase dashboard to verify update
4. Wait a few seconds for database sync

### Persona Not Responding Correctly:

**Possible Issues:**
1. Prompt too short (< 1500 chars)
2. Prompt too vague
3. Missing response guidelines
4. Gemini API key invalid
5. Prompt has conflicting instructions

**Fix:**
- Follow template structure above
- Be more specific about personality
- Add clear response guidelines
- Test prompt length

---

## Advanced: Batch Updates with Code

For complex updates, create a custom script:

```javascript
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function customUpdate() {
  // Get all personas
  const { data } = await supabase
    .from('personas')
    .select('*');

  // Process each one
  for (const persona of data) {
    let newPrompt = persona.system_prompt;

    // Add custom logic here
    // Example: Make business personas more formal
    if (persona.category === 'business') {
      newPrompt = newPrompt.replace(
        'Be warm and friendly',
        'Be professional yet warm'
      );
    }

    // Update
    await supabase
      .from('personas')
      .update({ system_prompt: newPrompt })
      .eq('id', persona.id);

    console.log(`✅ Updated ${persona.name}`);
  }
}

customUpdate();
```

---

## Summary

### Quick Reference:

| Task | Method | Command |
|------|--------|---------|
| **Bulk edit all prompts** | Script | `node scripts/edit-persona-prompts.js export` → edit → `import` |
| **Edit 1-2 prompts** | Supabase UI | Dashboard → Table Editor → Edit cell |
| **Update single prompt** | Script | `node scripts/edit-persona-prompts.js update "Name" "Prompt"` |
| **Pattern-based update** | SQL | Supabase SQL Editor → `UPDATE` query |
| **Backup prompts** | Script | Export and rename file |
| **Test changes** | Browser | `http://localhost:3000/personas` |

### Best Workflow:

1. **Export** → `node scripts/edit-persona-prompts.js export`
2. **Backup** → `cp persona-prompts-export.json backup.json`
3. **Edit** → Open JSON in VS Code, make changes
4. **Import** → `node scripts/edit-persona-prompts.js import`
5. **Test** → Chat with edited personas in browser

---

**Happy Editing!** 🎯
