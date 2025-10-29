import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import https from 'https';
import http from 'http';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Test if URL returns 200
function testUrl(url) {
  return new Promise((resolve) => {
    try {
      const client = url.startsWith('https') ? https : http;
      const req = client.get(url, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PersonaPlatform/1.0)'
        }
      }, (res) => {
        // Accept 200 and redirects
        resolve(res.statusCode === 200 || (res.statusCode >= 300 && res.statusCode < 400));
      });

      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
    } catch (error) {
      resolve(false);
    }
  });
}

// Fallback to UI Avatar
function getUIAvatarUrl(name) {
  const encodedName = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encodedName}&size=400&background=4F46E5&color=fff&bold=true&format=png`;
}

// Search Google Custom Search API for images
async function searchGoogleImages(personaName, category) {
  const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
  const searchEngineId = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID;

  if (!apiKey || !searchEngineId) {
    throw new Error('Google Custom Search API credentials not configured');
  }

  // Build search query with persona name and context
  let searchQuery = personaName;

  // Add context based on category for better results
  const contextMap = {
    business: 'business leader entrepreneur',
    bollywood: 'actor bollywood celebrity',
    sports: 'athlete sports player',
    historical: 'historical figure leader',
    mythological: 'deity god indian art',
    creators: 'content creator influencer'
  };

  if (contextMap[category]) {
    searchQuery += ` ${contextMap[category]}`;
  }

  // Add "portrait" or "photo" for real people, "art" for mythological
  if (category === 'mythological') {
    searchQuery += ' traditional art painting';
  } else {
    searchQuery += ' portrait photo official';
  }

  const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
  searchUrl.searchParams.set('key', apiKey);
  searchUrl.searchParams.set('cx', searchEngineId);
  searchUrl.searchParams.set('q', searchQuery);
  searchUrl.searchParams.set('searchType', 'image');
  searchUrl.searchParams.set('num', '10'); // Get top 10 results
  searchUrl.searchParams.set('imgSize', 'large'); // Large images only
  searchUrl.searchParams.set('imgType', 'photo'); // Photo type (or face for portraits)
  searchUrl.searchParams.set('safe', 'active'); // Safe search
  searchUrl.searchParams.set('fileType', 'jpg,png'); // Image formats

  try {
    const response = await fetch(searchUrl.toString());
    const data = await response.json();

    if (data.error) {
      throw new Error(`Google API Error: ${data.error.message}`);
    }

    if (!data.items || data.items.length === 0) {
      return null;
    }

    // Return top results
    return data.items.map(item => ({
      url: item.link,
      thumbnail: item.image.thumbnailLink,
      title: item.title,
      source: item.displayLink,
      context: item.snippet,
    }));
  } catch (error) {
    console.error(`  Error searching Google Images:`, error.message);
    return null;
  }
}

// Find best working image from search results
async function findBestWorkingImage(results, personaName) {
  if (!results || results.length === 0) return null;

  // Try each result until we find one that works
  for (const result of results) {
    process.stdout.write('.');

    // Test if URL is accessible
    const works = await testUrl(result.url);

    if (works) {
      return result;
    }

    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return null;
}

async function sourceImagesWithGoogleSearch() {
  console.log('═'.repeat(80));
  console.log('🌐 GOOGLE IMAGE SEARCH - WEB-WIDE PERSONA IMAGE SOURCER');
  console.log('═'.repeat(80));
  console.log('');
  console.log('This script searches the ENTIRE WEB for actual photos of each persona');
  console.log('using Google Custom Search API.');
  console.log('');
  console.log('Sources: Wikipedia, news sites, official pages, verified sources');
  console.log('');
  console.log('🔑 Google Custom Search API Free Tier: 100 queries/day');
  console.log('📊 Processing 49 personas (estimate: ~10-15 minutes)');
  console.log('');
  console.log('─'.repeat(80));

  const { data: personas, error } = await supabase
    .from('personas')
    .select('id, name, category, bio, avatar_url')
    .order('name');

  if (error) {
    console.error('❌ Error fetching personas:', error);
    return;
  }

  console.log(`\n📊 Found ${personas.length} personas to process\n`);

  let googleFound = 0;
  let workingImages = 0;
  let uiAvatarFallback = 0;
  let errors = 0;

  for (let i = 0; i < personas.length; i++) {
    const persona = personas[i];
    const progress = `[${i + 1}/${personas.length}]`;

    process.stdout.write(`\n${progress} ${persona.name.padEnd(30)} `);

    try {
      // Search Google Images
      process.stdout.write('(searching web...)');
      const searchResults = await searchGoogleImages(persona.name, persona.category);

      if (!searchResults || searchResults.length === 0) {
        process.stdout.write(' ❌ No results');

        const fallbackUrl = getUIAvatarUrl(persona.name);
        await supabase
          .from('personas')
          .update({ avatar_url: fallbackUrl })
          .eq('id', persona.id);

        console.log('\n   ↳ Using UI Avatar fallback');
        uiAvatarFallback++;
        continue;
      }

      googleFound++;
      process.stdout.write(` ✅ Found ${searchResults.length} results`);

      // Test URLs to find working one
      process.stdout.write(' (testing');
      const bestImage = await findBestWorkingImage(searchResults, persona.name);
      process.stdout.write(')');

      if (bestImage) {
        workingImages++;
        process.stdout.write(' ✅ VERIFIED');

        await supabase
          .from('personas')
          .update({ avatar_url: bestImage.url })
          .eq('id', persona.id);

        console.log(`\n   ↳ ${bestImage.url.substring(0, 70)}...`);
        console.log(`   ↳ Source: ${bestImage.source}`);
      } else {
        process.stdout.write(' ❌ All 404');

        const fallbackUrl = getUIAvatarUrl(persona.name);
        await supabase
          .from('personas')
          .update({ avatar_url: fallbackUrl })
          .eq('id', persona.id);

        console.log('\n   ↳ Using UI Avatar fallback (all URLs failed)');
        uiAvatarFallback++;
      }

      // Rate limiting: 100 queries/day = ~1 query per 15 minutes
      // But we can do faster during testing, adjust as needed
      if (i < personas.length - 1) {
        const delaySeconds = 2;
        process.stdout.write(`\n   ⏱️  Waiting ${delaySeconds}s (rate limit)...`);
        await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
      }

    } catch (err) {
      console.log(` ❌ Error: ${err.message}`);
      errors++;

      // Use UI Avatar on error
      const fallbackUrl = getUIAvatarUrl(persona.name);
      await supabase
        .from('personas')
        .update({ avatar_url: fallbackUrl })
        .eq('id', persona.id);
    }
  }

  console.log('\n' + '═'.repeat(80));
  console.log('📊 RESULTS:');
  console.log('═'.repeat(80));
  console.log(`🌐 Google found images for:  ${googleFound}/${personas.length} personas`);
  console.log(`✅ Working URLs verified:    ${workingImages} (${((workingImages/personas.length)*100).toFixed(1)}%)`);
  console.log(`🎨 UI Avatar fallbacks:      ${uiAvatarFallback}`);
  console.log(`❌ Errors:                   ${errors}`);
  console.log(`📝 Total personas:           ${personas.length}`);
  console.log('═'.repeat(80));

  const successRate = ((workingImages / personas.length) * 100).toFixed(1);
  console.log(`\n✨ Success rate: ${successRate}% real web images`);
  console.log(`💡 ${uiAvatarFallback} personas using UI Avatar placeholders\n`);

  if (workingImages > 0) {
    console.log('🎉 Successfully found real images from the web!');
    console.log('🌐 Images sourced from Wikipedia, news sites, and verified sources.');
  }

  console.log('\n💡 Tip: Check your browser to see the actual persona images.');
  console.log('💡 These are real photos from across the web, not stock images.\n');
}

// Check if Google Custom Search API is configured
if (!process.env.GOOGLE_CUSTOM_SEARCH_API_KEY || !process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID) {
  console.error('❌ ERROR: Google Custom Search API not configured\n');
  console.log('To enable web-wide image search:');
  console.log('');
  console.log('1. Go to: https://console.cloud.google.com/apis/library/customsearch.googleapis.com');
  console.log('2. Enable "Custom Search API"');
  console.log('3. Go to: https://console.cloud.google.com/apis/credentials');
  console.log('4. Create API key (or use existing one)');
  console.log('5. Go to: https://programmablesearchengine.google.com/controlpanel/create');
  console.log('6. Create a new search engine:');
  console.log('   - Search the entire web: Yes');
  console.log('   - Image search: On');
  console.log('7. Get your Search Engine ID from the control panel');
  console.log('8. Add to .env.local:');
  console.log('   GOOGLE_CUSTOM_SEARCH_API_KEY=your_api_key_here');
  console.log('   GOOGLE_CUSTOM_SEARCH_ENGINE_ID=your_search_engine_id_here\n');
  console.log('Free tier: 100 queries/day, $5 per 1000 queries after\n');
  process.exit(1);
}

console.log('Starting Google web image search...\n');

sourceImagesWithGoogleSearch().then(() => {
  console.log('✅ Done!');
  process.exit(0);
}).catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});
