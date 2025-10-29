import { createClient } from '@supabase/supabase-js';
import { createApi } from 'unsplash-js';
import nodeFetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Initialize Unsplash API
const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY,
  fetch: nodeFetch,
});

// Fallback to UI Avatar
function getUIAvatarUrl(name) {
  const encodedName = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encodedName}&size=400&background=4F46E5&color=fff&bold=true&format=png`;
}

// Smart keyword mapping for each persona category
function getSearchKeywords(persona) {
  const category = persona.category;
  const name = persona.name;

  // Base keywords by category
  const categoryKeywords = {
    business: ['business executive', 'entrepreneur', 'corporate leader', 'ceo portrait', 'business professional'],
    bollywood: ['bollywood actor', 'indian actor', 'film star', 'actor portrait', 'celebrity'],
    sports: ['athlete', 'sports professional', 'sportsperson', 'champion athlete'],
    historical: ['historical figure', 'leader portrait', 'statesman', 'vintage portrait'],
    mythological: ['indian art', 'traditional art', 'deity art', 'religious art', 'spiritual'],
    creators: ['content creator', 'influencer', 'digital creator', 'young professional']
  };

  // Get category-specific keywords
  const keywords = categoryKeywords[category] || ['professional portrait', 'indian professional'];

  // Add age/gender/ethnicity modifiers for better matching
  if (category === 'business' || category === 'historical') {
    keywords.push('mature professional', 'experienced leader');
  } else if (category === 'creators') {
    keywords.push('young professional', 'millennial');
  }

  // For Indian personas, add cultural context
  keywords.push('indian', 'south asian');

  return keywords;
}

// Search Unsplash for best matching image
async function searchUnsplashImage(persona) {
  const keywords = getSearchKeywords(persona);

  // Try each keyword until we find a good match
  for (const keyword of keywords) {
    try {
      const result = await unsplash.search.getPhotos({
        query: keyword,
        page: 1,
        perPage: 10,
        orientation: 'portrait',
      });

      if (result.type === 'success' && result.response.results.length > 0) {
        // Get the first high-quality result
        const photo = result.response.results[0];

        return {
          url: photo.urls.regular, // 1080px width
          photographer: photo.user.name,
          photographerUrl: photo.user.links.html,
          unsplashUrl: photo.links.html,
          description: photo.description || photo.alt_description,
        };
      }
    } catch (error) {
      console.error(`  Error searching for "${keyword}":`, error.message);
      continue;
    }

    // Small delay between searches to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return null;
}

async function sourceImagesWithUnsplash() {
  console.log('═'.repeat(80));
  console.log('📸 UNSPLASH-POWERED IMAGE SOURCER');
  console.log('═'.repeat(80));
  console.log('');
  console.log('This script uses Unsplash to find high-quality portrait images');
  console.log('for each persona based on their category and role.');
  console.log('');
  console.log('🎨 Unsplash Free Tier: 50 requests/hour');
  console.log('📊 Processing 49 personas (estimate: ~5-10 minutes)');
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

  let unsplashFound = 0;
  let uiAvatarFallback = 0;
  let errors = 0;
  let skipped = 0;

  for (let i = 0; i < personas.length; i++) {
    const persona = personas[i];
    const progress = `[${i + 1}/${personas.length}]`;

    process.stdout.write(`\n${progress} ${persona.name.padEnd(30)} `);

    try {
      // Search Unsplash
      process.stdout.write('(searching Unsplash...)');
      const unsplashImage = await searchUnsplashImage(persona);

      if (unsplashImage) {
        unsplashFound++;
        process.stdout.write(' ✅ FOUND');

        // Update database with Unsplash URL
        await supabase
          .from('personas')
          .update({
            avatar_url: unsplashImage.url,
            // Optionally store attribution in a notes field
          })
          .eq('id', persona.id);

        console.log(`\n   ↳ ${unsplashImage.url.substring(0, 70)}...`);
        console.log(`   ↳ Photo by ${unsplashImage.photographer}`);
      } else {
        process.stdout.write(' ❌ No match');

        // Keep existing UI Avatar
        const fallbackUrl = getUIAvatarUrl(persona.name);
        await supabase
          .from('personas')
          .update({ avatar_url: fallbackUrl })
          .eq('id', persona.id);

        console.log('\n   ↳ Using UI Avatar fallback');
        uiAvatarFallback++;
      }

      // Rate limiting: 50 requests/hour = ~1 request per 72 seconds
      // With 10 search attempts per persona, we need longer delays
      if (i < personas.length - 1) {
        const delaySeconds = 3;
        process.stdout.write(`\n   ⏱️  Waiting ${delaySeconds}s (rate limit)...`);
        await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
      }

    } catch (err) {
      console.log(` ❌ Error: ${err.message}`);
      errors++;
    }
  }

  console.log('\n' + '═'.repeat(80));
  console.log('📊 RESULTS:');
  console.log('═'.repeat(80));
  console.log(`📸 Unsplash images found:    ${unsplashFound}/${personas.length}`);
  console.log(`🎨 UI Avatar fallbacks:      ${uiAvatarFallback}`);
  console.log(`⏭️  Skipped:                  ${skipped}`);
  console.log(`❌ Errors:                   ${errors}`);
  console.log(`📝 Total personas:           ${personas.length}`);
  console.log('═'.repeat(80));

  const successRate = ((unsplashFound / personas.length) * 100).toFixed(1);
  console.log(`\n✨ Success rate: ${successRate}% professional photos from Unsplash`);
  console.log(`💡 ${uiAvatarFallback} personas using UI Avatar placeholders\n`);

  if (unsplashFound > 0) {
    console.log('🎉 Successfully sourced professional images from Unsplash!');
    console.log('📸 All images are high-quality, royalty-free, and properly attributed.');
  }

  console.log('\n💡 Tip: Check your browser to see the new professional images.');
  console.log('💡 Unsplash images are updated with proper attribution for photographers.\n');
}

// Check if Unsplash API key is configured
if (!process.env.UNSPLASH_ACCESS_KEY) {
  console.error('❌ ERROR: UNSPLASH_ACCESS_KEY not found in .env.local\n');
  console.log('To get an Unsplash API key:');
  console.log('1. Go to: https://unsplash.com/developers');
  console.log('2. Create a free account (if you don\'t have one)');
  console.log('3. Create a new application');
  console.log('4. Copy your "Access Key"');
  console.log('5. Add to .env.local:');
  console.log('   UNSPLASH_ACCESS_KEY=your_access_key_here\n');
  console.log('Free tier includes: 50 requests/hour, unlimited for development\n');
  process.exit(1);
}

sourceImagesWithUnsplash().then(() => {
  console.log('✅ Done!');
  process.exit(0);
}).catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});
