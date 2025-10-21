# Setup Guide - Future You

Complete setup instructions for local development and production deployment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Supabase Configuration](#supabase-configuration)
4. [OpenAI API Setup](#openai-api-setup)
5. [Upstash Redis Setup](#upstash-redis-setup)
6. [Running the Application](#running-the-application)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.0.0 or higher
- **pnpm**: Version 8.0.0 or higher (install with `npm install -g pnpm`)
- **Git**: For version control
- **A code editor**: VS Code recommended

### Verify installations:

```bash
node --version  # Should be v18.0.0 or higher
pnpm --version  # Should be 8.0.0 or higher
git --version   # Any recent version
```

## Local Development Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/future-you.git
cd future-you
```

### Step 2: Install Dependencies

```bash
pnpm install
```

This will install all required npm packages defined in `package.json`.

### Step 3: Create Environment File

```bash
cp .env.example .env.local
```

The `.env.local` file will contain your sensitive credentials and should never be committed to Git.

## Supabase Configuration

Supabase provides our PostgreSQL database and authentication.

### Step 1: Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project

### Step 2: Get API Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - Project URL (looks like: `https://xxxxx.supabase.co`)
   - `anon` public key
   - `service_role` secret key (click "Reveal" to see it)

### Step 3: Set Up Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **New Query**
3. Copy the entire contents of `src/lib/db/schema.sql`
4. Paste into the SQL Editor
5. Click **Run** to execute

This will create all necessary tables, indexes, triggers, and seed data.

### Step 4: Verify Setup

Go to **Table Editor** and verify these tables exist:
- `sessions`
- `personas`
- `conversations`
- `messages`
- `feedback`

You should also see 7 predefined personas in the `personas` table.

### Step 5: Add to Environment File

Update your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...
```

## OpenAI API Setup

OpenAI provides the GPT-4 Turbo model for conversations.

### Step 1: Create OpenAI Account

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Go to **API Keys** section

### Step 2: Add Payment Method

1. Go to **Billing** → **Payment methods**
2. Add a credit/debit card
3. Set a monthly budget (recommended: $50 to start)

### Step 3: Create API Key

1. Go to **API Keys**
2. Click **Create new secret key**
3. Name it "Future You Development"
4. Copy the key (you won't see it again!)

### Step 4: Add to Environment File

Update your `.env.local`:

```env
OPENAI_API_KEY=sk-...your-key-here...
```

### Step 5: Verify Access

Test your API key:

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

You should see a list of available models including `gpt-4-turbo-preview`.

## Upstash Redis Setup

Upstash provides serverless Redis for rate limiting (optional but recommended).

### Step 1: Create Upstash Account

1. Go to [console.upstash.com](https://console.upstash.com)
2. Sign up for free
3. Click **Create Database**

### Step 2: Configure Database

1. **Name**: `future-you-ratelimit`
2. **Type**: Regional
3. **Region**: Choose closest to your users (e.g., Mumbai for India)
4. **TLS**: Enable
5. Click **Create**

### Step 3: Get REST API Credentials

1. Go to your database details
2. Scroll to **REST API** section
3. Copy:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### Step 4: Add to Environment File

Update your `.env.local`:

```env
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXxxxx...
```

**Note**: If you skip this step, rate limiting will be disabled.

## Running the Application

### Development Mode

Start the development server:

```bash
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Production Build (Local Testing)

Build and run in production mode:

```bash
pnpm build
pnpm start
```

### Type Checking

Run TypeScript type checking:

```bash
pnpm type-check
```

### Linting

Check code quality:

```bash
pnpm lint
```

## Troubleshooting

### "Module not found" errors

**Solution**: Delete `node_modules` and reinstall:

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### API returns 401 Unauthorized

**Possible causes**:
1. OpenAI API key is invalid or expired
2. Supabase keys are incorrect
3. Environment variables not loaded

**Solution**: Verify all API keys in `.env.local` and restart dev server.

### Database connection errors

**Solution**:
1. Check Supabase project is active (not paused)
2. Verify URL and keys are correct
3. Ensure database schema was run successfully

### Rate limiting not working

**Solution**:
1. Verify Upstash Redis credentials
2. Check Upstash dashboard shows active database
3. If not needed, remove rate limit check from API

### Build fails with TypeScript errors

**Solution**:
1. Run `pnpm type-check` to see specific errors
2. Fix type issues in reported files
3. Ensure all imports use correct paths (`@/` alias)

### "Can't resolve 'framer-motion'" error

**Solution**:

```bash
pnpm add framer-motion
```

### Chat not loading

**Possible causes**:
1. Persona not selected
2. Fingerprint not generated
3. API route errors

**Solution**:
1. Check browser console for errors
2. Verify `/api/health` returns 200
3. Test `/api/personas` returns data
4. Clear localStorage and try again

### OpenAI API timeout

**Solution**:
1. Check your OpenAI account has credits
2. Verify model name is correct (`gpt-4-turbo-preview`)
3. Reduce `max_tokens` in API call if needed

## Next Steps

Once setup is complete:

1. Test the complete user flow: Home → Persona → Chat
2. Send a few messages to verify AI responses
3. Check Supabase database to see messages being saved
4. Review OpenAI usage in dashboard
5. Proceed to [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment

## Support

If you encounter issues not covered here:

1. Check GitHub Issues: [github.com/yourusername/future-you/issues](https://github.com/yourusername/future-you/issues)
2. Review Next.js docs: [nextjs.org/docs](https://nextjs.org/docs)
3. Contact support: support@futureyou.in
