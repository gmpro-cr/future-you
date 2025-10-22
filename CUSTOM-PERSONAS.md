# Custom Personas Feature

## Overview

Future You now supports creating your own custom AI personas! You can define unique characters with specific personalities, speaking styles, and areas of expertise.

## Features

- ✅ Create unlimited custom personas
- ✅ Edit existing personas
- ✅ Delete personas you no longer need
- ✅ Each persona has its own conversation history
- ✅ Simple, intuitive interface
- ✅ Data stored locally in your browser

## How to Use

### 1. Access Persona Management

**From Home Page:**
- Click "Start Your Journey" → Takes you to Personas page

**From Chat:**
- Click "Manage Personas" button in the sidebar

### 2. Create a New Persona

Click "Create New Persona" and fill in:

- **Emoji** (optional): Choose any emoji to represent your persona (e.g., 🚀, 💡, 🎨)
- **Persona Name** (required): Give your persona a descriptive name (max 50 characters)
  - Examples: "Tech Entrepreneur", "Zen Master", "Creative Artist"
- **Short Description** (required): Brief description visible on the persona card (max 100 characters)
  - Examples: "Built a successful startup after years of trial and error"
- **System Prompt** (required): Define how the AI should behave (max 1000 characters)
  - This is the most important field!
  - Write in first person ("I am...")
  - Be specific about personality, tone, and expertise

### 3. System Prompt Tips

**Good Example:**
```
I am your future self who became a successful tech entrepreneur. I speak warmly but confidently, drawing from my experience building three startups. I focus on practical advice about product development, team building, and resilience. I keep responses conversational and honest - I share both successes and failures. I respond in 2-4 sentences unless asked for details.
```

**What Makes a Good Prompt:**
- Clear personality and speaking style
- Specific area of expertise
- First-person perspective
- Response length guidance
- Tone specification

### 4. Chat with Your Persona

1. Click "Chat" button on any persona card
2. Start conversing!
3. Each persona maintains its own separate conversation history

### 5. Edit or Delete

- Click the edit icon (pencil) to modify a persona
- Click the delete icon (trash) to remove a persona
- Note: Deleting a persona will also clear its conversation history

## Technical Details

### Data Storage

- Personas are stored in browser's localStorage
- Each persona gets a unique ID (UUID)
- Conversations are saved separately per persona
- Data persists until you clear browser data

### Conversation Management

- Each persona has its own conversation thread
- Switching personas starts a fresh context
- Previous conversations are preserved
- "New Chat" button clears current persona's conversation

## Examples of Custom Personas

### 1. Career Coach
```
Name: Career Growth Expert
Emoji: 📈
Description: Climbed from entry-level to C-suite in 15 years
Prompt: I'm your future self who navigated a successful corporate career. I provide practical advice on networking, skill development, and career transitions. I'm direct but empathetic, and I always ask clarifying questions before giving advice. I respond in 3-4 sentences.
```

### 2. Fitness Mentor
```
Name: Healthy Future You
Emoji: 💪
Description: Transformed from couch potato to marathon runner
Prompt: I'm the version of you who finally got fit and stayed that way. I understand the struggles because I lived them. I give sustainable, science-based advice without being preachy. I celebrate small wins and help you stay motivated. Responses are 2-3 sentences with actionable tips.
```

### 3. Creative Writer
```
Name: Published Author
Emoji: ✍️
Description: Overcame writer's block and published 5 bestsellers
Prompt: I'm your future creative self who made it as an author. I help with writing challenges, story structure, and overcoming creative blocks. I'm encouraging but honest about the work required. I speak like a mentor who's been in the trenches. I keep advice practical and specific.
```

## Troubleshooting

**Persona not appearing?**
- Refresh the page - data loads from localStorage on mount

**Chat using wrong persona?**
- Click "Manage Personas" and select the correct one
- Make sure you clicked "Chat" on the right persona card

**Lost a persona?**
- Check if browser data/localStorage was cleared
- Personas are stored locally - can't be recovered if cleared

**Persona not responding correctly?**
- Edit the persona and refine the system prompt
- Be more specific about desired behavior
- Add response length guidance

**Chat not working / Database error?**
If you see errors like "null value in column 'persona_type' violates not-null constraint":

1. **This is a database schema issue** that needs to be fixed in Supabase
2. **Follow the fix guide**: See `DATABASE-FIX.md` for detailed instructions
3. **Quick fix**: Go to your Supabase SQL Editor and run:
   ```sql
   ALTER TABLE conversations ALTER COLUMN persona_type DROP NOT NULL;
   ALTER TABLE conversations ALTER COLUMN persona_type SET DEFAULT 'custom';
   ```
4. After running the SQL, refresh your app and try again

**Error Details:**
- The database was designed for predefined personas
- Custom personas use localStorage instead
- The `persona_type` column needs to be nullable to support this architecture
- Running the SQL migration fixes this permanently

## Future Enhancements (Planned)

- 🔄 Export/import personas
- ☁️ Cloud sync (optional)
- 📊 Conversation analytics
- 🎨 More customization options (colors, avatars)
- 🔀 Persona templates/marketplace

## API Integration

The custom personas integrate seamlessly with the chat API:

```typescript
// Request includes persona information
{
  sessionId: string,
  personaId: string,      // UUID of the persona
  personaPrompt: string,  // The custom system prompt
  message: string
}
```

## Security Notes

- All data stored locally - no server sync by default
- Prompts are sent to AI API for each message
- No personal data is extracted or stored separately
- Clear browser data to wipe all personas
