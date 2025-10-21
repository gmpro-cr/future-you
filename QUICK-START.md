# ⚡ Quick Start Guide

Your **Future You** app is almost ready! Follow these final steps:

---

## ✅ What's Already Done

- ✅ All 56 project files created
- ✅ Dependencies installed (npm)
- ✅ Gemini API configured (AIzaSyDSiIsv4WlZ42DDW1ITwnEOxKmw1CZS9n0)
- ✅ Supabase credentials configured
- ✅ Dev server running on http://localhost:3000
- ✅ Validation errors fixed
- ✅ 7 AI personas ready (Entrepreneur, Mindful, Visionary, Creative, Wealthy, IAS Officer, Balanced)

---

## 🎯 One Last Step: Initialize Database

**Your database tables don't exist yet.** You need to run the SQL schema once:

### Option 1: Via Supabase Dashboard (Recommended) ⭐

1. **Open Supabase SQL Editor**:
   - Go to: https://supabase.com/dashboard/project/exdjsvknudvfkabnifrg
   - Click **SQL Editor** in left sidebar
   - Click **New Query**

2. **Copy & Run Schema**:
   - Open file: `src/lib/db/schema.sql`
   - Select ALL contents (Cmd+A / Ctrl+A)
   - Paste into SQL Editor
   - Click **Run** (or press Ctrl+Enter)

3. **Wait for Success**:
   - You should see: ✅ Success message
   - Tables created: `sessions`, `personas`, `conversations`, `messages`, `feedback`

### Option 2: Copy-Paste Quick Schema

If you can't find the file, the complete schema is also in **SUPABASE-SETUP.md** (lines 48-202).

---

## 🧪 Verify Everything Works

After running the schema, verify your setup:

```bash
node verify-setup.js
```

Expected output:
```
🔍 Verifying Future You Setup...

1️⃣  Testing Supabase connection...
   ✅ Supabase connected successfully

2️⃣  Checking personas table...
   ✅ All 7 personas found:
      🚀 Entrepreneur (entrepreneur)
      🧘 Mindful (mindful)
      🔭 Visionary (visionary)
      🎨 Creative (creative)
      💰 Wealthy (wealthy)
      🇮🇳 IAS Officer (ias_officer)
      ⚖️ Balanced (balanced)

3️⃣  Checking other tables...
   ✅ sessions table exists
   ✅ conversations table exists
   ✅ messages table exists
   ✅ feedback table exists

4️⃣  Checking Gemini API key...
   ✅ Gemini API key configured

🎉 Setup Complete!

Next steps:
1. Visit http://localhost:3000
2. Click "Start Your Journey"
3. Select a persona (try Entrepreneur 🚀)
4. Send a message to your future self!
```

---

## 🚀 Test Your First Conversation

1. **Open Your Browser**:
   - Go to: http://localhost:3000

2. **Start Journey**:
   - Click **"Start Your Journey"** button

3. **Choose a Persona**:
   - Select **Entrepreneur** 🚀 (or any other persona)

4. **Send First Message**:
   - Try: *"Should I quit my job to start a business?"*
   - Or: *"What's the biggest risk I should take this year?"*

5. **Get AI Response**:
   - Your future self (powered by Gemini) will respond!
   - Messages are saved to Supabase

---

## 📊 Your Personas

| Persona | Emoji | Description |
|---------|-------|-------------|
| **Entrepreneur** | 🚀 | Built a successful startup; reflects on risk and resilience |
| **Mindful** | 🧘 | Achieved balance and calm after years of chaos |
| **Visionary** | 🔭 | Reached the top of your field through clarity and focus |
| **Creative** | 🎨 | The artist, writer, or dreamer you became |
| **Wealthy** | 💰 | Achieved financial independence through discipline |
| **IAS Officer** | 🇮🇳 | Embodies purpose, discipline, and service |
| **Balanced** | ⚖️ | Harmony between ambition and peace — your ideal self |

---

## 🐛 Troubleshooting

### Error: "relation 'personas' does not exist"
- **Cause**: Database schema not run yet
- **Fix**: Follow database initialization steps above

### Error: "Failed to generate response from Gemini API"
- **Cause**: Invalid or missing Gemini API key
- **Fix**: Check `.env.local` has `GEMINI_API_KEY=AIzaSyDSiIsv4WlZ42DDW1ITwnEOxKmw1CZS9n0`

### Dev server not running?
```bash
npm run dev
```

### Port 3000 already in use?
```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9

# Restart server
npm run dev
```

---

## 📁 Project Structure

```
future-you/
├── src/
│   ├── app/              # Next.js 14 App Router
│   │   ├── api/chat/     # Chat API endpoint
│   │   ├── persona/      # Persona selection page
│   │   └── chat/         # Chat interface
│   ├── components/       # React components
│   ├── hooks/            # Custom hooks (useChat, usePersona)
│   ├── lib/              # Core logic
│   │   ├── api/          # API clients (Gemini, Supabase)
│   │   ├── db/           # Database schema
│   │   └── prompts/      # 7 persona prompts
│   └── types/            # TypeScript types
├── .env.local            # API credentials (✅ configured)
└── verify-setup.js       # Setup verification script
```

---

## 🎯 What's Next?

After your first conversation works:

1. **Explore Other Personas**: Try talking to Mindful 🧘 or IAS Officer 🇮🇳
2. **Multiple Conversations**: Each persona has separate conversation history
3. **Deployment**: Deploy to Vercel (see `DEPLOYMENT.md`)
4. **Customization**: Add custom personas, tweak prompts

---

## 💡 Pro Tips

- **Context Memory**: The app remembers last 8 messages for context
- **Token Limits**: Responses capped at 500 tokens (Gemini 1.5 Pro)
- **Anonymous Sessions**: Uses browser fingerprinting (no login required)
- **Data Privacy**: All conversations stored in your Supabase instance

---

## 📚 Documentation

- **Database Setup**: See `SUPABASE-SETUP.md`
- **Deployment**: See `DEPLOYMENT.md`
- **Project Overview**: See `PROJECT-SUMMARY.md`
- **Full Setup**: See `SETUP.md`

---

**Ready to talk to your future self!** 🚀

*Just run the database schema and you're good to go!*
