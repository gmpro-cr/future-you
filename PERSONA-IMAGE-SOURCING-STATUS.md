# Persona Image Sourcing - Implementation Status

**Last Updated:** October 30, 2025
**Status:** Ready for API Key Configuration

---

## 📋 Overview

The Esperit platform needs high-quality, authentic images for all 49 personas. We've implemented a comprehensive Google Custom Search API integration that sources **real photos from across the web** (Wikipedia, news sites, official sources).

---

## ✅ What's Been Implemented

### 1. **Google Custom Search Integration** ✅

**File:** `scripts/google-image-search.js` (300 lines)

**Features:**
- Context-aware search queries based on persona category
- Automatic URL verification (tests each image URL before saving)
- Smart fallback to UI Avatars for failed searches
- Rate limiting compliance (2-second delays between personas)
- Support for 6 persona categories with tailored keywords
- Comprehensive logging and progress tracking

**Categories Supported:**
- Business → "business leader entrepreneur ceo"
- Bollywood → "actor bollywood celebrity"
- Sports → "athlete sports player"
- Historical → "historical figure leader"
- Mythological → "deity god indian art traditional painting"
- Creators → "content creator influencer"

### 2. **Setup Documentation** ✅

**File:** `GOOGLE-CUSTOM-SEARCH-SETUP.md` (400+ lines)

**Contents:**
- Step-by-step API credential setup
- Environment variable configuration
- Script execution guide
- Troubleshooting section
- Legal/licensing considerations
- Comparison with Unsplash alternative
- Pro tips for customization

### 3. **Environment Configuration** ✅

**File:** `.env.example` (updated)

**Added Variables:**
```bash
GOOGLE_CUSTOM_SEARCH_API_KEY=your_api_key_here
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=your_search_engine_id_here
```

---

## 🚀 What You Need to Do Next

### Step 1: Get Google Custom Search API Credentials

**Time Required:** ~10 minutes

1. **Enable Custom Search API**
   - Visit: https://console.cloud.google.com/apis/library/customsearch.googleapis.com
   - Click "Enable"

2. **Create API Key**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click "Create Credentials" → "API key"
   - Copy the generated key
   - Restrict to "Custom Search API" (recommended)

3. **Create Search Engine**
   - Visit: https://programmablesearchengine.google.com/controlpanel/create
   - Select "Search the entire web"
   - Enable "Image search"
   - Name it "Esperit Persona Image Search"
   - Copy the Search Engine ID

**Detailed Instructions:** See `GOOGLE-CUSTOM-SEARCH-SETUP.md`

### Step 2: Configure Environment Variables

Add to your `.env.local` file:

```bash
# Google Custom Search API Configuration
GOOGLE_CUSTOM_SEARCH_API_KEY=AIzaSy... # Your API key from step 1
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=a1b2c3d... # Your search engine ID from step 1
```

### Step 3: Run the Image Sourcer Script

```bash
node scripts/google-image-search.js
```

**Expected Duration:** ~10-15 minutes (processes all 49 personas)

**What Happens:**
1. Searches Google for each persona by name
2. Tests up to 10 image URLs per persona
3. Saves first working URL to Supabase
4. Falls back to UI Avatar if all URLs fail
5. Displays progress and final statistics

**Expected Success Rate:** 70-85% (35-40 personas with real web images)

### Step 4: Verify Results

```bash
npm run dev
# Navigate to http://localhost:3000/personas
```

Check that:
- Images load correctly
- Real photos appear for most personas
- UI Avatars show for personas with no working images
- No broken image icons

---

## 📊 Expected Results

### Sample Output:

```
═══════════════════════════════════════════════════════════════════════
🌐 GOOGLE IMAGE SEARCH - WEB-WIDE PERSONA IMAGE SOURCER
═══════════════════════════════════════════════════════════════════════

[1/49] Ratan Tata            (searching web...) ✅ Found 10 results (testing..) ✅ VERIFIED
   ↳ https://upload.wikimedia.org/wikipedia/commons/.../Ratan_Tata.jpg
   ↳ Source: en.wikipedia.org

[2/49] Narayana Murthy       (searching web...) ✅ Found 10 results (testing...) ✅ VERIFIED
   ↳ https://www.business-today.com/.../narayana-murthy.jpg
   ↳ Source: business-today.com

...

═══════════════════════════════════════════════════════════════════════
📊 RESULTS:
═══════════════════════════════════════════════════════════════════════
🌐 Google found images for:  47/49 personas
✅ Working URLs verified:    38 (77.6%)
🎨 UI Avatar fallbacks:      11
❌ Errors:                   0
═══════════════════════════════════════════════════════════════════════

✨ Success rate: 77.6% real web images
```

---

## 🔍 Technical Architecture

### How It Works

1. **Search Query Construction**
   ```javascript
   // Example for Ratan Tata (business category)
   Query: "Ratan Tata business leader entrepreneur portrait photo official"

   // Example for Lord Krishna (mythological category)
   Query: "Lord Krishna deity god indian art traditional art painting"
   ```

2. **Google Custom Search API Call**
   - Searches entire web for images
   - Parameters: large images, photo type, safe search
   - Returns top 10 results with URLs and metadata

3. **URL Verification**
   ```javascript
   For each image URL:
   - Send HTTP HEAD request (5-second timeout)
   - Accept 200 OK and 3xx redirects
   - Reject 404 Not Found and timeouts
   - Return first working URL
   ```

4. **Database Update**
   ```javascript
   Update personas table:
   - Set avatar_url to verified image URL
   - Or fallback to UI Avatar if all URLs fail
   ```

5. **Rate Limiting**
   - 2-second delay between personas
   - Respects Google's 100 queries/day free tier
   - Total time: ~10-15 minutes for 49 personas

### File Structure

```
scripts/
└── google-image-search.js      # Main sourcing script (300 lines)

docs/
└── GOOGLE-CUSTOM-SEARCH-SETUP.md  # Setup guide (400+ lines)

.env.example                    # Environment template (updated)
.env.local                      # Your credentials (add keys here)
```

---

## 🆚 Why Google Custom Search vs Unsplash?

| Feature | Google Custom Search | Unsplash |
|---------|---------------------|----------|
| **Image Type** | Real photos of specific people | Generic stock photos |
| **Example** | Actual photo of "Ratan Tata" | Generic "businessman" |
| **Sources** | Entire web (Wikipedia, news, etc.) | Unsplash photographers |
| **Success Rate** | 70-85% for real people | 60-80% for generic roles |
| **Best For** | Real personas (like ours) | Fictional/abstract personas |
| **Free Tier** | 100 queries/day | 50 queries/hour |
| **Licensing** | Varies (review needed) | Unsplash License (free) |

**Verdict:** Google Custom Search is perfect for Esperit because we need real photos of actual people (Ratan Tata, SRK, Virat Kohli, etc.), not generic stock images.

---

## ⚠️ Important Considerations

### 1. **API Costs**

**Free Tier:**
- 100 queries per day
- Perfect for initial setup (49 personas = 1 query each)
- Can re-run script once per day if needed

**Paid Tier (if needed):**
- $5 per 1,000 queries
- Up to 10,000 queries/day
- Only needed for frequent updates

### 2. **Image Licensing**

**Important:** Images sourced from the web may have copyright restrictions.

**Best Practices:**
1. Wikipedia images are often CC-licensed (check attribution)
2. Official press photos may have usage terms
3. Consider adding image credits in UI
4. For commercial use, consult legal counsel

**Safer Approach:**
- Manually verify top 10-15 most popular personas
- Replace with confirmed licensed images
- Use Wikipedia Commons images where available
- Commission custom illustrations if budget allows

### 3. **Image Quality & Maintenance**

**Pros:**
- Real, authentic photos of actual people
- High-quality, professional images
- Sourced from reputable sites

**Cons:**
- URLs may break over time (sites change/remove images)
- Need periodic maintenance to fix broken links
- Some personas may not have good web images

**Recommendation:**
- Run script initially to populate all personas
- Manually curate top 15-20 personas with best images
- Set up monitoring to detect broken images
- Re-run script quarterly to refresh URLs

---

## 🛠️ Troubleshooting

### Script Won't Run

**Error:** "Google Custom Search API not configured"

**Solution:**
1. Check `.env.local` has both variables
2. Ensure no typos or extra spaces
3. Restart terminal and try again

### Low Success Rate

**Problem:** < 50% of personas get real images

**Solutions:**
1. Check internet connection (firewall blocking HTTP?)
2. Increase timeout in `testUrl()` function (line 19)
3. Customize search keywords in `contextMap` (lines 58-65)

### Images Not Loading in Browser

**Problem:** Next.js blocks external images

**Solution:** Add to `next.config.js`:
```javascript
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all HTTPS images
      }
    ],
  },
}
```

---

## 📈 Future Enhancements

### Potential Improvements:

1. **Automatic Re-verification**
   - Cron job to test URLs monthly
   - Auto-replace broken images
   - Send alerts for manual review

2. **Image Caching**
   - Download and host images locally
   - Eliminates dependency on external URLs
   - Faster loading, better reliability
   - Requires storage solution (S3, Cloudinary, etc.)

3. **Manual Override System**
   - Admin UI to upload custom images
   - Override automatic sourcing for specific personas
   - Store both auto and manual URLs

4. **Attribution Display**
   - Show image credits in UI
   - "Photo credit: Wikipedia" etc.
   - Better legal compliance

5. **Multi-Source Fallback Chain**
   ```
   1. Manual upload (if exists)
   2. Google Custom Search
   3. Unsplash
   4. UI Avatar
   ```

---

## 📝 Summary Checklist

**Setup (One-Time):**
- [ ] Enable Google Custom Search API
- [ ] Create API key
- [ ] Create Custom Search Engine
- [ ] Add credentials to `.env.local`

**Execution:**
- [ ] Run `node scripts/google-image-search.js`
- [ ] Review console output for errors
- [ ] Check success rate (target: 70%+)

**Verification:**
- [ ] Start dev server (`npm run dev`)
- [ ] Navigate to personas page
- [ ] Verify images load correctly
- [ ] Check image quality and appropriateness

**Production (Before Launch):**
- [ ] Manual curation of top 15 personas
- [ ] Legal review of image sources
- [ ] Add image domains to `next.config.js`
- [ ] Consider hosting images locally
- [ ] Set up monitoring for broken images

---

## 🎯 Current Status

✅ **Implementation:** Complete
✅ **Documentation:** Complete
✅ **Configuration:** Ready
⏳ **API Setup:** Waiting for user credentials
⏳ **Script Execution:** Ready to run once configured
⏳ **Verification:** Pending execution

**Next Action:** User needs to get Google API credentials and run the script.

---

## 📞 Getting Help

**Documentation:**
- Setup guide: `GOOGLE-CUSTOM-SEARCH-SETUP.md`
- Script source: `scripts/google-image-search.js`
- Google API docs: https://developers.google.com/custom-search

**Support:**
- Google Custom Search: https://support.google.com/programmable-search
- Script issues: Check console output for detailed errors

---

**Ready to proceed?** Follow the steps in the "What You Need to Do Next" section above! 🚀
