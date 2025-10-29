# Google Custom Search API Integration Setup Guide

**Purpose:** Source real, high-quality images for all 49 personas from across the entire web

---

## 🎯 What This Does

The Google Custom Search integration will:
- Search the **entire web** for actual photos/portraits of each persona
- Sources from Wikipedia, news sites, official websites, verified sources
- Tests each URL to ensure images are accessible (no 404s)
- Provides context-aware searches based on persona category
- Falls back to UI Avatars only if no working images found
- Respects Google's rate limits (100 queries/day on free tier)

**Key Advantage over Unsplash:** Finds actual photos of specific people (e.g., real photo of "Ratan Tata" instead of generic business executive)

---

## 📝 Step 1: Get Google Custom Search API Credentials

### 1.1 Enable Custom Search API

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/apis/library/customsearch.googleapis.com
   - Sign in with your Google account

2. **Enable the API**
   - Click "Enable" button
   - Wait for activation (takes ~30 seconds)

### 1.2 Create API Key

1. **Go to Credentials Page**
   - Visit: https://console.cloud.google.com/apis/credentials
   - Or from the API page, click "Create Credentials"

2. **Create API Key**
   - Click "+ CREATE CREDENTIALS" at the top
   - Select "API key"
   - Copy the generated key immediately
   - **IMPORTANT:** Keep this key secure!

3. **Restrict API Key (Recommended)**
   - Click "Edit API key" (or the pencil icon)
   - Under "API restrictions", select "Restrict key"
   - Choose "Custom Search API" from the dropdown
   - Click "Save"

### 1.3 Create Custom Search Engine

1. **Go to Programmable Search Engine**
   - Visit: https://programmablesearchengine.google.com/controlpanel/create
   - Sign in if needed

2. **Configure Search Engine**
   - **Search the entire web:** Select "Search the entire web"
   - **Image search:** Turn ON (this is critical)
   - **Search engine name:** "Esperit Persona Image Search"
   - Click "Create"

3. **Get Search Engine ID**
   - After creation, you'll see your control panel
   - Copy the **Search engine ID** (looks like: `a1b2c3d4e5f6g7h8i`)
   - You can also find this later under "Basics" → "Search engine ID"

4. **Verify Settings**
   - Go to "Setup" → "Basics"
   - Ensure "Search the entire web" is enabled
   - Go to "Setup" → "Image search"
   - Ensure image search is ON

---

## 🔧 Step 2: Configure Environment Variables

### Add to `.env.local`

```bash
# Google Custom Search API Configuration (for persona images)
GOOGLE_CUSTOM_SEARCH_API_KEY=your_api_key_here
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=your_search_engine_id_here
```

**Example:**
```bash
GOOGLE_CUSTOM_SEARCH_API_KEY=AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=a1b2c3d4e5f6g7h8i
```

---

## 🚀 Step 3: Run the Image Sourcer

### Execute the Script

```bash
node scripts/google-image-search.js
```

### What Happens:

**1. Smart Context-Aware Searches**

The script builds intelligent search queries based on persona category:

- **Business personas** → searches: "Ratan Tata business leader entrepreneur portrait photo official"
- **Bollywood personas** → searches: "Shah Rukh Khan actor bollywood celebrity portrait photo official"
- **Sports personas** → searches: "Virat Kohli athlete sports player portrait photo official"
- **Historical personas** → searches: "Mahatma Gandhi historical figure leader portrait photo official"
- **Mythological personas** → searches: "Lord Krishna deity god indian art traditional art painting"
- **Creators** → searches: "Bhuvan Bam content creator influencer portrait photo official"

**2. URL Verification**

- Tests each returned image URL with HTTP HEAD request
- Accepts 200 OK responses and valid redirects
- Rejects 404 Not Found and timeouts
- Tests up to 10 results per persona until one works
- 5-second timeout per URL test

**3. Database Update**

- Updates `personas.avatar_url` in Supabase
- Only updates if a working URL is found
- Falls back to UI Avatar if all URLs fail
- Preserves source information in logs

**4. Rate Limiting**

- Free tier: **100 queries per day**
- Script waits 2 seconds between personas
- Processes all 49 personas in ~10-15 minutes
- Total API calls: 49 searches (well under daily limit)

---

## 📊 Expected Results

### Success Metrics

**Estimated Success Rate:** 70-85% (35-40 personas with real web images)

### Sample Output:

```
═══════════════════════════════════════════════════════════════════════════
🌐 GOOGLE IMAGE SEARCH - WEB-WIDE PERSONA IMAGE SOURCER
═══════════════════════════════════════════════════════════════════════════

This script searches the ENTIRE WEB for actual photos of each persona
using Google Custom Search API.

Sources: Wikipedia, news sites, official pages, verified sources

🔑 Google Custom Search API Free Tier: 100 queries/day
📊 Processing 49 personas (estimate: ~10-15 minutes)

───────────────────────────────────────────────────────────────────────────

[1/49] Ratan Tata                     (searching web...) ✅ Found 10 results (testing..) ✅ VERIFIED
   ↳ https://upload.wikimedia.org/wikipedia/commons/.../Ratan_Tata.jpg
   ↳ Source: en.wikipedia.org
   ⏱️  Waiting 2s (rate limit)...

[2/49] Narayana Murthy                (searching web...) ✅ Found 10 results (testing...) ✅ VERIFIED
   ↳ https://www.business-today.com/.../narayana-murthy.jpg
   ↳ Source: business-today.com
   ⏱️  Waiting 2s (rate limit)...

[3/49] Nita Ambani                    (searching web...) ✅ Found 10 results (testing) ❌ All 404
   ↳ Using UI Avatar fallback (all URLs failed)

...

═══════════════════════════════════════════════════════════════════════════
📊 RESULTS:
═══════════════════════════════════════════════════════════════════════════
🌐 Google found images for:  47/49 personas
✅ Working URLs verified:    38 (77.6%)
🎨 UI Avatar fallbacks:      11
❌ Errors:                   0
📝 Total personas:           49
═══════════════════════════════════════════════════════════════════════════

✨ Success rate: 77.6% real web images
💡 11 personas using UI Avatar placeholders

🎉 Successfully found real images from the web!
🌐 Images sourced from Wikipedia, news sites, and verified sources.

💡 Tip: Check your browser to see the actual persona images.
💡 These are real photos from across the web, not stock images.
```

### Why Some May Fail:

- **Mythological figures:** May have art/paintings instead of photos (intentional)
- **Recent creators:** Fewer images indexed by Google
- **Privacy settings:** Some images blocked by robots.txt
- **Broken links:** URLs that worked when indexed but now 404

**Fallback:** UI Avatars provides clean, professional placeholders for failed searches

---

## 🎨 Image Quality & Licensing

### What You Get

✅ **Resolution:** Large images (typically 1000px+)
✅ **Type:** Actual photos from news, Wikipedia, official sources
✅ **Format:** JPG/PNG (web-optimized)
✅ **Verification:** All URLs tested before saving
✅ **Sources:** Reputable sites (Wikipedia, news outlets, official pages)

### Important Legal Notes

**⚠️ Copyright Consideration:**

This script sources images from the public web. While these images are publicly accessible:

1. **Fair Use Assessment Required**
   - Educational/commentary purposes may qualify
   - Transformative use (AI persona platform) may qualify
   - Check your local jurisdiction's fair use laws

2. **Best Practices:**
   - Wikipedia images are often CC-licensed (check attribution)
   - Official press photos may have usage restrictions
   - Consider adding image credits/attribution in UI
   - For commercial use, consult a legal professional

3. **Safer Alternatives:**
   - Use Wikipedia Commons images (CC-licensed)
   - Use official press kit photos (often freely licensed)
   - Commission custom illustrations
   - Use public domain images for historical figures

**Recommendation:** For production use, manually review and replace any images with verified licensing.

---

## 🔍 Script Architecture

### Key Functions

**`searchGoogleImages(personaName, category)`**
- Builds context-aware search query
- Calls Google Custom Search API
- Returns top 10 image results
- Parameters: large images, photo type, safe search

**`testUrl(url)`**
- Sends HTTP HEAD request with timeout
- Accepts 200 and 3xx redirect codes
- Includes user-agent header
- Returns boolean (working or not)

**`findBestWorkingImage(results, personaName)`**
- Iterates through search results
- Tests each URL until one works
- Returns first working image with metadata
- 200ms delay between tests

**`getUIAvatarUrl(name)`**
- Generates fallback placeholder
- Uses initials on colored background
- 400px size, professional styling

---

## 🛠️ Troubleshooting

### Error: "Google Custom Search API not configured"

**Solution:** Add credentials to `.env.local` (see Step 2)

### Error: "Google API Error: The API key is invalid"

**Solutions:**
1. Verify you copied the entire key (no spaces/linebreaks)
2. Check key is enabled for Custom Search API
3. Regenerate key in Google Cloud Console
4. Ensure no trailing spaces in `.env.local`

### Error: "Rate limit exceeded"

**Solution:**
- Free tier: Wait until next day (resets at midnight PST)
- Or upgrade to paid tier ($5 per 1000 queries)

### Low Success Rate (< 50%)

**Possible Causes:**
1. Network issues (firewall blocking HTTP requests)
2. Timeout too short (increase in `testUrl()`)
3. Search queries not specific enough (edit `contextMap`)

**Solutions:**
1. Check internet connection
2. Increase timeout from 5000ms to 10000ms
3. Customize search queries for better results

### Images Not Loading in Next.js

**Solution:** Add image domains to `next.config.js`:

```javascript
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all HTTPS images
      },
      {
        protocol: 'http',
        hostname: '**', // Allow all HTTP images (for testing)
      }
    ],
  },
}
```

Or be more restrictive:
```javascript
domains: [
  'upload.wikimedia.org',
  'www.wikipedia.org',
  'images.indianexpress.com',
  'www.business-standard.com',
  'ui-avatars.com',
  // Add more as needed
]
```

---

## 🔄 Re-running the Script

**The script is safe to run multiple times:**
- Will re-search and update all persona images
- No duplicate entries created
- Overwrites previous `avatar_url` values
- Falls back to UI Avatar if searches fail

**To update specific personas:**
1. Edit script to filter by category:
```javascript
const { data: personas } = await supabase
  .from('personas')
  .select('id, name, category, bio, avatar_url')
  .eq('category', 'business') // Only business personas
  .order('name');
```

2. Or filter by name pattern:
```javascript
.ilike('name', '%Kumar%') // Only names containing "Kumar"
```

---

## 📈 Monitoring Usage

### Check Your Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/api/customsearch.googleapis.com
2. Click "Metrics" tab
3. View statistics:
   - Requests today
   - Requests this month
   - Error rates
   - Latency

### API Quotas

- **Free Tier:** 100 queries/day
- **Paid Tier:** $5 per 1,000 queries (up to 10,000/day)
- **Upgrade:** https://console.cloud.google.com/apis/api/customsearch.googleapis.com/quotas

---

## 🎯 Next Steps

After running the script:

1. **Verify in Browser**
   ```bash
   npm run dev
   # Navigate to http://localhost:3000/personas
   ```

2. **Check Quality**
   - Are images appropriate for each persona?
   - Any broken images?
   - Do mythological personas have art instead of photos?

3. **Manual Curation** (Recommended)
   - For top 10-15 most popular personas
   - Find official press photos or Wikipedia Commons images
   - Update directly in Supabase database
   - Add proper attribution

4. **Legal Review**
   - Document image sources
   - Check licensing for commercial use
   - Add attribution in UI where required
   - Consider replacing with licensed images

5. **Deploy to Production**
   - Ensure all image URLs are HTTPS
   - Add image domains to `next.config.js`
   - Test image loading on production
   - Monitor for broken images over time

---

## 💡 Pro Tips

### Improve Search Quality

Edit search queries in `scripts/google-image-search.js`:

```javascript
const contextMap = {
  business: 'indian business leader entrepreneur ceo india',
  bollywood: 'bollywood actor celebrity india portrait',
  sports: 'indian athlete sports star player',
  // Customize for better results
};
```

### Selective Category Updates

Update only one category at a time:

```bash
# Edit script to filter:
.eq('category', 'mythological')
```

Run script, verify results, then move to next category.

### Save Image Metadata

Optionally store source information (requires schema update):

```javascript
await supabase
  .from('personas')
  .update({
    avatar_url: bestImage.url,
    image_source: bestImage.source,
    image_title: bestImage.title,
    image_context: bestImage.context
  })
  .eq('id', persona.id);
```

---

## 📞 Support Resources

### Google Custom Search API
- **Documentation:** https://developers.google.com/custom-search/v1/overview
- **API Reference:** https://developers.google.com/custom-search/v1/reference/rest/v1/cse/list
- **Pricing:** https://developers.google.com/custom-search/v1/overview#pricing
- **Support:** https://support.google.com/programmable-search

### Script Issues
- Check console output for detailed errors
- Verify `.env.local` configuration
- Ensure stable internet connection
- Check Google Cloud Console for API status

---

## ✨ Comparison: Google Custom Search vs Unsplash

| Feature | Google Custom Search | Unsplash |
|---------|---------------------|----------|
| **Image Type** | Real photos of specific people | Generic stock photos |
| **Example** | Actual photo of "Ratan Tata" | Generic "businessman" photo |
| **Sources** | Entire web (Wikipedia, news, etc.) | Unsplash photographer library |
| **Best For** | Real people, celebrities, historical figures | Generic personas, abstract roles |
| **Free Tier** | 100 queries/day | 50 queries/hour |
| **Accuracy** | Very high (finds exact person) | Low (generic matches) |
| **Licensing** | Varies by source (review needed) | Unsplash License (free use) |
| **Success Rate** | 70-85% for real people | 60-80% for generic roles |

**Recommendation:** Use Google Custom Search for Esperit's 49 real personas (actual people). Unsplash is better for fictional/generic personas.

---

## ✅ Conclusion

Once configured, the Google Custom Search integration provides:
- ✅ Real photos of actual personas from across the web
- ✅ High success rate (70-85%) for real people
- ✅ Automatic URL verification (no broken images)
- ✅ Intelligent context-aware searches
- ✅ Professional UI Avatar fallbacks
- ✅ Free tier sufficient for 49 personas

**Estimated time to complete:** 20-30 minutes (setup + script execution)

**Legal consideration:** Manual review recommended for production use to ensure proper licensing and attribution.

---

**Ready to get started? Follow Step 1 above!** 🚀
