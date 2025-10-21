# Deployment Guide - Future You

Complete guide for deploying Future You to production on Vercel.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Vercel Deployment](#vercel-deployment)
3. [Environment Variables](#environment-variables)
4. [Custom Domain Setup](#custom-domain-setup)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Scaling Considerations](#scaling-considerations)

## Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] Tested the application locally (run `pnpm dev` and test all features)
- [ ] All environment variables documented
- [ ] Supabase database schema deployed
- [ ] OpenAI API account with payment method added
- [ ] Upstash Redis configured (optional but recommended)
- [ ] GitHub repository created and code pushed
- [ ] Production-ready `.env.example` file
- [ ] No console errors or warnings
- [ ] Build succeeds locally (`pnpm build`)

## Vercel Deployment

Vercel is the recommended platform for deploying Next.js applications.

### Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with your GitHub account
3. Verify your email address

### Step 2: Import Project

1. Click **Add New** → **Project**
2. Import your `future-you` repository from GitHub
3. Vercel will auto-detect it's a Next.js project

### Step 3: Configure Project

**Build Settings** (auto-detected):
- Framework Preset: Next.js
- Build Command: `pnpm build`
- Output Directory: `.next`
- Install Command: `pnpm install`

**Root Directory**: Leave as `.` (root)

### Step 4: Add Environment Variables

Click **Environment Variables** and add all from your `.env.local`:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-...

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...

# Upstash Redis (Optional)
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXxxxx...

# Application
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Important**:
- Mark `OPENAI_API_KEY` and `SUPABASE_SERVICE_KEY` as **sensitive**
- Apply to **Production**, **Preview**, and **Development** environments

### Step 5: Deploy

1. Click **Deploy**
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like `https://future-you-xxx.vercel.app`

### Step 6: Verify Deployment

1. Visit your deployment URL
2. Test the complete flow:
   - Home page loads
   - Can select a persona
   - Can send messages and receive responses
3. Check browser console for errors
4. Verify API endpoints work:
   - `https://your-app.vercel.app/api/health`
   - `https://your-app.vercel.app/api/personas`

## Environment Variables

### Required Variables

| Variable | Where to Get | Notes |
|----------|--------------|-------|
| `OPENAI_API_KEY` | platform.openai.com | Starts with `sk-` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Settings → API | Public, safe to expose |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Settings → API | Public, safe to expose |
| `SUPABASE_SERVICE_KEY` | Supabase Settings → API | **Secret**, server-only |
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL | E.g., `https://futureyou.in` |

### Optional Variables

| Variable | Purpose | Default Behavior if Missing |
|----------|---------|------------------------------|
| `UPSTASH_REDIS_REST_URL` | Rate limiting | Rate limiting disabled |
| `UPSTASH_REDIS_REST_TOKEN` | Rate limiting | Rate limiting disabled |

### Managing Environment Variables

**To update a variable:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Delete the old variable
3. Add new variable
4. Redeploy for changes to take effect

**Security Best Practices:**
- Never commit `.env.local` to Git
- Use different keys for development and production
- Rotate OpenAI API keys quarterly
- Enable Vercel's environment variable encryption

## Custom Domain Setup

### Step 1: Purchase Domain

Recommended registrars for India:
- Namecheap: futureyou.in
- GoDaddy: futureyou.co.in
- Google Domains: futureyou.com

### Step 2: Add Domain to Vercel

1. Go to Project Settings → Domains
2. Click **Add**
3. Enter your domain (e.g., `futureyou.in`)
4. Click **Add**

### Step 3: Configure DNS

Vercel will show you DNS records to add. Go to your domain registrar and add:

**For root domain (futureyou.in):**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### Step 4: Wait for DNS Propagation

- Can take 24-48 hours
- Check status: [dnschecker.org](https://dnschecker.org)
- Vercel will auto-issue SSL certificate once DNS is verified

### Step 5: Update Environment Variable

Update `NEXT_PUBLIC_APP_URL` to your custom domain:

```env
NEXT_PUBLIC_APP_URL=https://futureyou.in
```

## Post-Deployment Verification

### Automated Checks

Run these tests after deployment:

1. **Health Check**
   ```bash
   curl https://futureyou.in/api/health
   ```
   Expected: `{"success":true,"data":{"status":"healthy"}}`

2. **Personas Endpoint**
   ```bash
   curl https://futureyou.in/api/personas
   ```
   Expected: JSON with 7 personas

3. **Performance Test**
   - Use [PageSpeed Insights](https://pagespeed.web.dev/)
   - Target: 90+ score on mobile and desktop

4. **SSL Certificate**
   - Check padlock icon in browser
   - Certificate should be valid and issued by Let's Encrypt

### Manual Testing Checklist

- [ ] Home page loads in < 2 seconds
- [ ] All personas display correctly
- [ ] Can select a persona and navigate to chat
- [ ] Chat interface loads without errors
- [ ] Can send message and receive AI response
- [ ] Typing indicator appears while waiting
- [ ] Messages persist after page refresh
- [ ] Mobile responsive design works on phone
- [ ] No console errors in browser dev tools

## Monitoring & Maintenance

### Vercel Analytics

Enable Vercel Analytics for real-time insights:

1. Go to Analytics tab in Vercel dashboard
2. Enable Web Analytics
3. View metrics: page views, unique visitors, top pages

### Error Tracking

**Option 1: Vercel Logs**
- Go to Deployments → Select deployment → Logs
- Filter by errors
- Review real-time logs

**Option 2: Sentry (Recommended for production)**

1. Create account at [sentry.io](https://sentry.io)
2. Create new project (Next.js)
3. Install Sentry:
   ```bash
   pnpm add @sentry/nextjs
   npx @sentry/wizard -i nextjs
   ```
4. Add `SENTRY_DSN` to environment variables
5. Redeploy

### Cost Monitoring

**OpenAI API:**
1. Go to [platform.openai.com/usage](https://platform.openai.com/usage)
2. Set up budget alerts:
   - Settings → Billing → Usage limits
   - Set soft limit: $50
   - Set hard limit: $100
3. Monitor daily usage

**Estimated monthly costs:**
- 1,000 users: ~₹6,500 (OpenAI) + Free (Vercel/Supabase)
- 10,000 users: ~₹65,000 (OpenAI) + ₹0-5,000 (may need paid tiers)

### Database Maintenance

**Supabase Dashboard:**
1. Monitor storage usage (500MB free tier)
2. Review slow queries
3. Set up weekly backups:
   - Settings → Database → Backups
   - Enable automated backups

**Clean old data** (optional):
```sql
-- Delete sessions older than 90 days
DELETE FROM sessions WHERE created_at < NOW() - INTERVAL '90 days';

-- Archive inactive conversations
UPDATE conversations
SET is_active = false
WHERE updated_at < NOW() - INTERVAL '60 days';
```

## Scaling Considerations

### When to Scale

Scale when you hit these limits:

1. **Vercel Free Tier:**
   - 100GB bandwidth/month
   - 100 deployments/day

2. **Supabase Free Tier:**
   - 500MB database
   - 50,000 monthly active users
   - 2GB bandwidth

3. **Upstash Redis Free Tier:**
   - 10,000 requests/day

### Scaling Strategy

**Phase 1: 1K-10K users**
- Stay on free tiers
- Optimize API calls (reduce tokens)
- Cache frequent responses
- Monitor costs daily

**Phase 2: 10K-50K users**
- Upgrade Vercel to Pro ($20/month)
- Upgrade Supabase to Pro ($25/month)
- Upgrade Upstash to Standard ($10/month)
- Implement more aggressive rate limiting

**Phase 3: 50K+ users**
- Consider serverless Redis (Upstash Scale)
- Database read replicas (Supabase Fly.io)
- CDN caching for static assets
- Consider paid tier for OpenAI (volume discounts)

### Performance Optimization

**Frontend:**
```bash
# Analyze bundle size
pnpm build
npx @next/bundle-analyzer
```

**Backend:**
- Use caching for persona prompts
- Reduce `max_tokens` in OpenAI calls (500 → 300)
- Implement conversation summaries for long chats
- Use edge functions for API routes

### Backup & Disaster Recovery

**Database Backups:**
1. Supabase provides daily backups (free tier: 7 days)
2. For critical data, use manual backups:
   ```bash
   pg_dump -h db.xxxxx.supabase.co -U postgres > backup.sql
   ```

**Code Backups:**
- GitHub is your primary backup
- Tag releases: `git tag v1.0.0 && git push --tags`
- Keep deployment logs in Vercel

**Recovery Plan:**
1. If deployment fails: Rollback to previous deployment in Vercel
2. If database corrupted: Restore from Supabase backup
3. If API key compromised: Rotate immediately and redeploy

## Troubleshooting

### Deployment fails

**Error**: "Build failed with exit code 1"

**Solution**:
1. Check Vercel build logs for specific error
2. Run `pnpm build` locally to reproduce
3. Fix TypeScript/ESLint errors
4. Ensure all dependencies are in `package.json`

### 404 on API routes

**Solution**:
1. Verify routes are in `src/app/api/`
2. Check `next.config.js` doesn't have conflicting rewrites
3. Ensure `.ts` extension (not `.js`)

### Environment variables not working

**Solution**:
1. Verify variables are added in Vercel dashboard
2. Check variable names match exactly
3. Redeploy after adding/changing variables
4. For client-side variables, ensure `NEXT_PUBLIC_` prefix

### High OpenAI costs

**Solution**:
1. Reduce `max_tokens` in API calls
2. Implement response caching
3. Add more aggressive rate limiting
4. Limit conversation context (8 messages instead of 10)

## Support

For deployment issues:
- Vercel Support: [vercel.com/support](https://vercel.com/support)
- Supabase Docs: [supabase.com/docs](https://supabase.com/docs)
- Project Issues: [GitHub Issues](https://github.com/yourusername/future-you/issues)

---

**Congratulations!** Your Future You app is now live in production. 🎉
