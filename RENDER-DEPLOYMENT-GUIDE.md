# 🚀 Deploy Future You to Render

Complete guide to deploy the Future You Next.js application on Render.

---

## Prerequisites

✅ GitHub repository: https://github.com/gmpro-cr/future-you
✅ Render account (sign up at https://render.com)
✅ Environment variables ready

---

## 🎯 Quick Deploy (5 Minutes)

### Option 1: Deploy via Render Dashboard (Recommended)

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Click **"New +"** → **"Web Service"**

2. **Connect Your Repository**
   - Click **"Connect GitHub"**
   - Select repository: `gmpro-cr/future-you`
   - Click **"Connect"**

3. **Configure Service**
   ```
   Name: future-you
   Region: Oregon (US West)
   Branch: main
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   Plan: Free
   ```

4. **Add Environment Variables**
   Click **"Advanced"** → **"Add Environment Variable"**

   Add these variables:
   ```bash
   # Required - Gemini AI API
   GEMINI_API_KEY=your_gemini_api_key_here

   # Required - Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_KEY=your_service_key

   # Required - NextAuth
   NEXTAUTH_URL=https://future-you.onrender.com
   NEXTAUTH_SECRET=your_secret_generated_with_openssl

   # Required - Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # App Configuration
   NEXT_PUBLIC_APP_URL=https://future-you.onrender.com
   NODE_ENV=production
   ```

5. **Deploy!**
   - Click **"Create Web Service"**
   - Wait 5-10 minutes for build to complete
   - Your app will be live at: `https://future-you.onrender.com`

---

### Option 2: Deploy via Blueprint (Using render.yaml)

The repository includes a `render.yaml` file for automated deployment.

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Click **"New +"** → **"Blueprint"**

2. **Connect Repository**
   - Select repository: `gmpro-cr/future-you`
   - Render will detect `render.yaml` automatically
   - Click **"Apply"**

3. **Configure Environment Variables**
   - Add all required environment variables (same as Option 1)
   - Render will use the config from `render.yaml`

4. **Deploy**
   - Click **"Deploy"**
   - Wait for build to complete

---

## 🔐 Environment Variables Setup

### 1. Gemini API Key
Get from: https://makersuite.google.com/app/apikey
```bash
GEMINI_API_KEY=AIzaSy...
```

### 2. Supabase Configuration
Get from: https://app.supabase.com (Your project → Settings → API)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...
```

### 3. NextAuth Configuration
Generate secret:
```bash
openssl rand -base64 32
```
Then set:
```bash
NEXTAUTH_URL=https://your-app.onrender.com
NEXTAUTH_SECRET=<generated-secret>
```

### 4. Google OAuth
Get from: https://console.cloud.google.com/apis/credentials

**Important:** Add authorized redirect URI:
```
https://your-app.onrender.com/api/auth/callback/google
```

Then set:
```bash
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
```

---

## 📋 Deployment Checklist

Before deploying, make sure:

- [ ] All environment variables are configured
- [ ] Google OAuth redirect URI includes your Render URL
- [ ] Supabase project is accessible
- [ ] Latest code is pushed to GitHub (`main` branch)
- [ ] `package.json` has correct build scripts
- [ ] `.gitignore` excludes `.env.local` and `.next`

---

## 🔧 Configuration Files

### render.yaml
Located at: `/render.yaml`

This file configures:
- Service type (web)
- Node runtime
- Build & start commands
- Environment variable placeholders
- Health check path
- Free tier plan

### package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Build Fails
**Error:** `Module not found` or `Cannot find package`

**Solution:**
```bash
# Make sure package.json includes all dependencies
# Check build command includes: npm install
Build Command: npm install && npm run build
```

### Issue 2: Environment Variables Not Working
**Solution:**
- Go to Render Dashboard → Your Service → Environment
- Click **"Edit"** and verify all variables are set
- Redeploy: Click **"Manual Deploy"** → **"Deploy latest commit"**

### Issue 3: Google OAuth Not Working
**Solution:**
1. Go to Google Cloud Console
2. Add Render URL to authorized redirect URIs:
   ```
   https://your-app.onrender.com/api/auth/callback/google
   ```
3. Update `NEXTAUTH_URL` environment variable

### Issue 4: App Shows "Application Error"
**Solution:**
- Check logs: Render Dashboard → Your Service → Logs
- Common causes:
  - Missing environment variables
  - Port binding (Render provides `PORT` automatically)
  - Database connection issues

### Issue 5: Free Tier Sleep (50s delay)
**Info:** Render free tier services sleep after 15 minutes of inactivity.
- First request after sleep takes ~50 seconds
- Consider upgrading to paid plan for production

---

## 📊 Monitoring & Logs

### View Logs
1. Go to Render Dashboard
2. Select your service: **future-you**
3. Click **"Logs"** tab
4. View real-time deployment and runtime logs

### Check Deployment Status
- **Building:** Blue indicator
- **Live:** Green indicator
- **Failed:** Red indicator

### Performance Monitoring
- Free tier includes:
  - 512 MB RAM
  - Shared CPU
  - 100 GB bandwidth/month

---

## 🔄 Updates & Redeployment

### Automatic Deployments
Render automatically deploys when you push to `main` branch:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Render detects the push and rebuilds automatically.

### Manual Deployment
1. Go to Render Dashboard
2. Select your service
3. Click **"Manual Deploy"** → **"Deploy latest commit"**

### Disable Auto-Deploy
1. Render Dashboard → Your Service
2. Settings → **Auto-Deploy**
3. Toggle off

---

## 💰 Pricing

### Free Tier (Current)
- ✅ 512 MB RAM
- ✅ Shared CPU
- ✅ 100 GB bandwidth/month
- ⚠️ Services spin down after 15 min inactivity
- ⚠️ 50s cold start time

### Starter Plan ($7/month)
- ✅ 512 MB RAM
- ✅ Shared CPU
- ✅ Always-on (no cold starts)
- ✅ 100 GB bandwidth/month

### Standard Plan ($25/month)
- ✅ 2 GB RAM
- ✅ 1 CPU
- ✅ Always-on
- ✅ 400 GB bandwidth/month

---

## 🔗 Useful Links

- **Render Dashboard:** https://dashboard.render.com
- **Render Docs:** https://render.com/docs
- **Next.js on Render:** https://render.com/docs/deploy-nextjs
- **Your Repository:** https://github.com/gmpro-cr/future-you
- **Support:** https://community.render.com

---

## ✅ Post-Deployment

After successful deployment:

1. **Test the App**
   - Visit: `https://your-app.onrender.com`
   - Test Google Sign In
   - Create a persona
   - Start a chat conversation

2. **Update Google OAuth**
   - Add production URL to authorized origins
   - Test authentication flow

3. **Monitor Performance**
   - Check Render logs for errors
   - Monitor response times
   - Review Supabase usage

4. **Share Your App**
   - Your app is now live!
   - Share URL: `https://future-you.onrender.com`

---

## 🎉 Success!

Your Future You app is now deployed on Render!

**Next Steps:**
- Add custom domain (optional)
- Set up monitoring
- Consider upgrading to paid plan for better performance
- Share with users

---

**Need Help?**
- Render Community: https://community.render.com
- GitHub Issues: https://github.com/gmpro-cr/future-you/issues

---

Generated with Claude Code 🤖
