import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import https from 'https';
import http from 'http';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

// Test if URL returns 200
function testUrl(url) {
  return new Promise((resolve) => {
    try {
      const client = url.startsWith('https') ? https : http;
      const req = client.get(url, { timeout: 5000 }, (res) => {
        resolve(res.statusCode === 200);
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

// Use Gemini to find authentic image URLs
async function findImageWithGemini(personaName, category, bio) {
  const prompt = `I need to find an authentic, publicly accessible image URL for ${personaName}, who is in the ${category} category.

Bio: ${bio}

Please provide:
1. A direct URL to a real, publicly accessible image (NOT a placeholder)
2. Prefer these sources in order:
   - Wikipedia Commons (upload.wikimedia.org)
   - Official news sites (livemint.com, ndtv.com, thehindu.com)
   - Government/official archives (for historical figures)

IMPORTANT RULES:
- URL must be a direct link to an image file (ending in .jpg, .jpeg, .png, .webp)
- URL must be publicly accessible (no authentication required)
- For Wikipedia, use actual file URLs that exist (e.g., https://upload.wikimedia.org/wikipedia/commons/...)
- For mythological/religious figures, use traditional art from Wikipedia Commons
- Do NOT invent URLs - only provide URLs you're confident exist
- If you're not sure an image exists, say "UNCERTAIN"

Respond ONLY with:
URL: [the direct image URL]
OR
URL: UNCERTAIN

Do not include any other text.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text().trim();

    // Extract URL from response
    const urlMatch = response.match(/URL:\s*(.+)/i);
    if (!urlMatch) return null;

    const url = urlMatch[1].trim();
    if (url === 'UNCERTAIN' || url === 'NONE') return null;

    // Clean up URL
    return url.replace(/[<>'"]/g, '');
  } catch (error) {
    console.error(`Error with Gemini for ${personaName}:`, error.message);
    return null;
  }
}

// Fallback to UI Avatar
function getUIAvatarUrl(name) {
  const encodedName = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encodedName}&size=400&background=4F46E5&color=fff&bold=true&format=png`;
}

async function sourceImagesWithGemini() {
  console.log('🤖 Starting Gemini-powered image sourcing...\n');
  console.log('This will use AI to find authentic images for each persona.\n');

  const { data: personas, error } = await supabase
    .from('personas')
    .select('id, name, category, bio, avatar_url')
    .order('name');

  if (error) {
    console.error('❌ Error fetching personas:', error);
    return;
  }

  console.log(`📊 Found ${personas.length} personas to process\n`);
  console.log('─'.repeat(80));

  let geminiFound = 0;
  let geminiTested = 0;
  let geminiWorking = 0;
  let uiAvatarFallback = 0;
  let errors = 0;

  for (const persona of personas) {
    process.stdout.write(`\n🔍 ${persona.name.padEnd(30)} `);

    try {
      // Ask Gemini to find an image URL
      process.stdout.write('(querying Gemini...)');
      const geminiUrl = await findImageWithGemini(persona.name, persona.category, persona.bio.substring(0, 200));

      if (!geminiUrl) {
        process.stdout.write(' ❌ No URL found');
        const fallbackUrl = getUIAvatarUrl(persona.name);

        await supabase
          .from('personas')
          .update({ avatar_url: fallbackUrl })
          .eq('id', persona.id);

        console.log('\n   ↳ Using UI Avatar fallback');
        uiAvatarFallback++;
        continue;
      }

      geminiFound++;
      process.stdout.write(` ✅ Found URL`);

      // Test if the URL actually works
      process.stdout.write(' (testing...)');
      geminiTested++;
      const urlWorks = await testUrl(geminiUrl);

      if (urlWorks) {
        geminiWorking++;
        process.stdout.write(' ✅ VERIFIED');

        await supabase
          .from('personas')
          .update({ avatar_url: geminiUrl })
          .eq('id', persona.id);

        console.log(`\n   ↳ ${geminiUrl.substring(0, 70)}...`);
      } else {
        process.stdout.write(' ❌ 404');
        const fallbackUrl = getUIAvatarUrl(persona.name);

        await supabase
          .from('personas')
          .update({ avatar_url: fallbackUrl })
          .eq('id', persona.id);

        console.log('\n   ↳ Using UI Avatar fallback (Gemini URL was 404)');
        uiAvatarFallback++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (err) {
      console.log(` ❌ Error: ${err.message}`);
      errors++;
    }
  }

  console.log('\n' + '─'.repeat(80));
  console.log('\n📊 RESULTS:');
  console.log('─'.repeat(80));
  console.log(`🤖 Gemini found URLs:        ${geminiFound}/${personas.length}`);
  console.log(`🧪 URLs tested:              ${geminiTested}`);
  console.log(`✅ Working URLs:             ${geminiWorking}`);
  console.log(`🎨 UI Avatar fallbacks:      ${uiAvatarFallback}`);
  console.log(`❌ Errors:                   ${errors}`);
  console.log(`📝 Total personas:           ${personas.length}`);
  console.log('─'.repeat(80));

  const successRate = ((geminiWorking / personas.length) * 100).toFixed(1);
  console.log(`\n✨ Success rate: ${successRate}% real images`);
  console.log(`💡 ${personas.length - geminiWorking} personas using UI Avatar placeholders\n`);

  if (geminiWorking > 0) {
    console.log('🎉 Gemini successfully found real images for some personas!');
  }

  console.log('\n💡 Tip: Check the database to see which personas got real images.');
  console.log('💡 You can re-run this script to try again for failed personas.\n');
}

console.log('═'.repeat(80));
console.log('🤖 GEMINI-POWERED IMAGE SOURCER');
console.log('═'.repeat(80));
console.log('');
console.log('This script uses Google Gemini AI to intelligently find');
console.log('authentic, publicly accessible images for each persona.');
console.log('');

sourceImagesWithGemini().then(() => {
  console.log('✅ Done!');
  process.exit(0);
}).catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});
