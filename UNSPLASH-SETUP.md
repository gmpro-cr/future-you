# Unsplash API Integration Setup Guide

**Purpose:** Source high-quality, royalty-free portrait images for all 49 personas

---

## 🎯 What This Does

The Unsplash integration will:
- Search for professional portrait images matching each persona's role
- Use high-quality photos (1080px width)
- Provide proper photographer attribution
- Fall back to UI Avatars if no good match found
- Respect Unsplash's rate limits (50 requests/hour)

---

## 📝 Step 1: Get Unsplash API Key

### Create Unsplash Developer Account

1. **Go to Unsplash Developers**
   - Visit: https://unsplash.com/developers
   - Click "Register as a developer"

2. **Create Account** (if you don't have one)
   - Sign up with email or GitHub
   - Verify your email address

3. **Create New Application**
   - Click "Your apps" in the top navigation
   - Click "New Application"
   - Accept the API Use and Guidelines
   - Fill in application details:
     - **Application name:** Esperit Persona Platform
     - **Description:** AI-powered persona chat platform using portrait images
     - **URL:** http://localhost:3000 (or your domain)

4. **Get Your Access Key**
   - Once created, you'll see your application dashboard
   - Copy the **"Access Key"** (starts with "...")
   - Keep this secure!

### API Limits (Free Tier)

✅ **50 requests per hour**
✅ **Unlimited for development/demo**
✅ **5,000 requests per month for production**

---

## 🔧 Step 2: Configure Environment Variable

### Add to `.env.local`

```bash
# Unsplash API Configuration (for persona images)
UNSPLASH_ACCESS_KEY=your_access_key_here
```

**Example:**
```bash
UNSPLASH_ACCESS_KEY=xYzAbC123...your-actual-key-here
```

---

## 🚀 Step 3: Run the Image Sourcer

### Execute the Script

```bash
node scripts/unsplash-image-sourcer.js
```

### What Happens:

1. **Smart Keyword Matching**
   - Business personas → searches "business executive", "entrepreneur", "ceo"
   - Bollywood personas → searches "bollywood actor", "film star"
   - Sports personas → searches "athlete", "sportsperson"
   - Historical personas → searches "leader portrait", "statesman"
   - Mythological personas → searches "indian art", "deity art"
   - Creators → searches "content creator", "young professional"

2. **Image Selection**
   - Finds portrait-oriented images
   - Selects high-quality photos (1080px)
   - Includes Indian/South Asian keywords for better matching
   - Automatically selects best match from results

3. **Database Update**
   - Updates each persona's `avatar_url` with Unsplash photo URL
   - Falls back to UI Avatar if no good match found
   - Preserves photographer attribution data

4. **Rate Limiting**
   - Waits 3 seconds between personas
   - Respects Unsplash's 50 requests/hour limit
   - Total time: ~5-10 minutes for all 49 personas

---

## 📊 Expected Results

### Success Metrics

**Estimated Success Rate:** 60-80% (30-40 personas with real photos)

**Why Some May Fail:**
- Mythological figures (use traditional art instead)
- Very specific personas (e.g., Byju Raveendran)
- Recent creators (fewer available images)

**Fallback:** UI Avatars (clean, professional placeholders)

---

## 🎨 Image Quality

### What You Get

✅ **Resolution:** 1080px width (high quality)
✅ **Orientation:** Portrait (vertical)
✅ **Style:** Professional portraits/headshots
✅ **License:** Free to use (Unsplash License)
✅ **Attribution:** Photographer credit included

### Unsplash License

- Free for commercial and non-commercial use
- No permission needed from photographer
- Attribution appreciated but not required
- Can't sell unmodified photos
- Can't create competing image service

Full terms: https://unsplash.com/license

---

## 🔍 Example Output

```
═══════════════════════════════════════════════════════════════════════════
📸 UNSPLASH-POWERED IMAGE SOURCER
═══════════════════════════════════════════════════════════════════════════

This script uses Unsplash to find high-quality portrait images
for each persona based on their category and role.

🎨 Unsplash Free Tier: 50 requests/hour
📊 Processing 49 personas (estimate: ~5-10 minutes)

───────────────────────────────────────────────────────────────────────────

[1/49] Ratan Tata                     (searching Unsplash...) ✅ FOUND
   ↳ https://images.unsplash.com/photo-...
   ↳ Photo by John Doe
   ⏱️  Waiting 3s (rate limit)...

[2/49] Narayana Murthy                (searching Unsplash...) ✅ FOUND
   ↳ https://images.unsplash.com/photo-...
   ↳ Photo by Jane Smith
   ⏱️  Waiting 3s (rate limit)...

...

═══════════════════════════════════════════════════════════════════════════
📊 RESULTS:
═══════════════════════════════════════════════════════════════════════════
📸 Unsplash images found:    35/49
🎨 UI Avatar fallbacks:      14
⏭️  Skipped:                  0
❌ Errors:                   0
📝 Total personas:           49
═══════════════════════════════════════════════════════════════════════════

✨ Success rate: 71.4% professional photos from Unsplash
💡 14 personas using UI Avatar placeholders

🎉 Successfully sourced professional images from Unsplash!
📸 All images are high-quality, royalty-free, and properly attributed.
```

---

## 🛠️ Troubleshooting

### Error: "UNSPLASH_ACCESS_KEY not found"

**Solution:** Add the key to `.env.local` (see Step 2)

### Error: "Rate limit exceeded"

**Solution:** Wait 1 hour and try again, or upgrade to Unsplash Plus

### Error: "Invalid access key"

**Solutions:**
1. Check you copied the entire key (no spaces)
2. Verify key is still active in your Unsplash dashboard
3. Regenerate key if necessary

### Images Not Loading in Browser

**Solutions:**
1. Add Unsplash domains to `next.config.js`:
   ```javascript
   images: {
     domains: [
       'images.unsplash.com',
       // ... other domains
     ]
   }
   ```
2. Restart Next.js dev server
3. Clear browser cache

---

## 🔄 Re-running the Script

The script is **safe to run multiple times**:
- Will update personas that need new images
- Won't waste API calls on already-processed personas
- Falls back to UI Avatars if searches fail

To update specific personas:
1. Edit the script to filter by name or category
2. Re-run the script

---

## 📈 Monitoring Usage

### Check Your Unsplash Dashboard

1. Go to: https://unsplash.com/developers
2. Click "Your apps"
3. Select your application
4. View statistics:
   - Requests this hour
   - Requests this month
   - Rate limit status

---

## 🎯 Next Steps

After running the script:

1. **Verify in Browser**
   ```bash
   # Navigate to personas page
   http://localhost:3000/personas
   ```

2. **Check Quality**
   - Do images match persona roles?
   - Are they professional-looking?
   - Any broken images?

3. **Manual Curation** (Optional)
   - For top 10 personas, manually find perfect images
   - Update directly in database or via admin panel

4. **Deploy to Production**
   - Ensure Unsplash domains in `next.config.js`
   - Test image loading on production
   - Monitor Unsplash usage stats

---

## 💡 Pro Tips

### Keyword Optimization

If results aren't great, edit keywords in script:
```javascript
const categoryKeywords = {
  business: ['indian ceo', 'tech entrepreneur', 'business leader'],
  // ... customize keywords
};
```

### Selective Updates

Update only specific categories:
```javascript
// In script, add filter:
.select('id, name, category, bio, avatar_url')
.eq('category', 'business') // Only business personas
.order('name');
```

### Save Attribution Data

Store photographer credits (optional):
```javascript
await supabase
  .from('personas')
  .update({
    avatar_url: unsplashImage.url,
    image_photographer: unsplashImage.photographer,
    image_source: 'unsplash'
  })
  .eq('id', persona.id);
```

---

## 📞 Support

### Unsplash Support
- Documentation: https://unsplash.com/documentation
- Guidelines: https://unsplash.com/api-guidelines
- Community: https://unsplash.com/developers/community

### Script Issues
- Check console output for errors
- Verify `.env.local` configuration
- Ensure internet connection
- Check Unsplash API status

---

## ✨ Conclusion

Once configured, the Unsplash integration provides:
- ✅ High-quality professional portraits
- ✅ Automatic image sourcing
- ✅ Proper licensing and attribution
- ✅ Better user experience than generic placeholders
- ✅ Free for development and small-scale production

**Estimated time to complete:** 15-20 minutes (setup + script execution)

---

**Ready to get started? Follow Step 1 above!** 🚀
