import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import https from 'https';
import http from 'http';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Function to test if URL returns 200
function testUrl(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;

    client.get(url, { timeout: 5000 }, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => {
      resolve(false);
    }).on('timeout', () => {
      resolve(false);
    });
  });
}

// Fallback strategy: Use UI Avatars for clean, professional placeholders
function getUIAvatarUrl(name) {
  const encodedName = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encodedName}&size=400&background=4F46E5&color=fff&bold=true&format=png`;
}

// Better image sources for specific personas (using more reliable URLs)
const reliableImages = {
  // Sports personalities - these Wikipedia URLs are more stable
  'Sachin Tendulkar': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Sachin_Tendulkar_2011.jpg/440px-Sachin_Tendulkar_2011.jpg',
  'Virat Kohli': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Virat_Kohli_during_the_India_vs_Aus_4th_Test_match_at_Narendra_Modi_Stadium_on_09_March_2023.jpg/440px-Virat_Kohli_during_the_India_vs_Aus_4th_Test_match_at_Narendra_Modi_Stadium_on_09_March_2023.jpg',

  // Bollywood - stable Wikipedia Commons images
  'Shah Rukh Khan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Shah_Rukh_Khan_graces_the_launch_of_the_new_Santro.jpg/440px-Shah_Rukh_Khan_graces_the_launch_of_the_new_Santro.jpg',

  // Historical figures - public domain images
  'Mahatma Gandhi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Mahatma-Gandhi%2C_studio%2C_1931.jpg/440px-Mahatma-Gandhi%2C_studio%2C_1931.jpg',
  'APJ Abdul Kalam': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/A._P._J._Abdul_Kalam.jpg/440px-A._P._J._Abdul_Kalam.jpg',

  // Mythological figures - use Unsplash art/illustrations
  'Krishna': 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&q=80',
  'Ganesha': 'https://images.unsplash.com/photo-1599639957043-f3aa5c986398?w=400&q=80',
  'Hanuman': 'https://images.unsplash.com/photo-1604337737449-a08e49348c85?w=400&q=80',
  'Shiva': 'https://images.unsplash.com/photo-1605798959106-b0c1e66e90e8?w=400&q=80',
};

async function fixBrokenImages() {
  console.log('🔍 Fetching all personas from database...\n');

  const { data: personas, error } = await supabase
    .from('personas')
    .select('id, name, avatar_url')
    .order('name');

  if (error) {
    console.error('❌ Error fetching personas:', error);
    return;
  }

  console.log(`📊 Found ${personas.length} personas to check\n`);

  let fixedCount = 0;
  let workingCount = 0;
  let errorCount = 0;

  for (const persona of personas) {
    process.stdout.write(`Testing: ${persona.name.padEnd(25)} ... `);

    // Check if current URL works
    const currentWorks = await testUrl(persona.avatar_url);

    if (currentWorks) {
      console.log('✅ Working');
      workingCount++;
      continue;
    }

    console.log('❌ Broken');

    // Try reliable image first
    let newUrl = reliableImages[persona.name];
    let source = 'reliable';

    if (newUrl) {
      const reliableWorks = await testUrl(newUrl);
      if (!reliableWorks) {
        newUrl = getUIAvatarUrl(persona.name);
        source = 'UI Avatar';
      }
    } else {
      newUrl = getUIAvatarUrl(persona.name);
      source = 'UI Avatar';
    }

    // Update database
    const { error: updateError } = await supabase
      .from('personas')
      .update({ avatar_url: newUrl })
      .eq('id', persona.id);

    if (updateError) {
      console.log(`  ❌ Failed to update: ${updateError.message}`);
      errorCount++;
    } else {
      console.log(`  ✅ Fixed with ${source}: ${newUrl.substring(0, 60)}...`);
      fixedCount++;
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('📊 Summary:');
  console.log('='.repeat(70));
  console.log(`✅ Already working: ${workingCount}`);
  console.log(`🔧 Fixed: ${fixedCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📝 Total personas: ${personas.length}`);
  console.log('='.repeat(70));

  if (fixedCount > 0) {
    console.log('\n✨ Success! All broken images have been fixed.');
    console.log('💡 Tip: Clear browser cache and refresh to see updated images.');
  }
}

console.log('🚀 Starting broken image fix process...\n');
fixBrokenImages().then(() => {
  console.log('\n✅ Done!');
  process.exit(0);
}).catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});
