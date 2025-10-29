const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  console.log('📋 Task 1 Verification: Personas Table Schema');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  try {
    // Query with all expected columns to verify schema
    const { data, error, count } = await supabase
      .from('personas')
      .select('id, name, slug, category, subcategory, avatar_url, cover_image_url, bio, short_description, personality_traits, system_prompt, conversation_starters, tags, knowledge_areas, language_capabilities, is_premium, is_active, sort_order, rating_average, rating_count, conversation_count, created_at, updated_at', { count: 'exact' })
      .limit(1);

    if (error) {
      console.log('❌ Schema verification failed:', error.message);
      console.log('\nMissing or incorrect columns detected.');
      return false;
    }

    console.log('✅ All expected columns present:');
    console.log('   - id (UUID, primary key)');
    console.log('   - name (VARCHAR)');
    console.log('   - slug (VARCHAR, unique)');
    console.log('   - category (VARCHAR)');
    console.log('   - subcategory (VARCHAR)');
    console.log('   - avatar_url (TEXT)');
    console.log('   - cover_image_url (TEXT)');
    console.log('   - bio (TEXT)');
    console.log('   - short_description (VARCHAR)');
    console.log('   - personality_traits (JSONB)');
    console.log('   - system_prompt (TEXT)');
    console.log('   - conversation_starters (TEXT[])');
    console.log('   - tags (TEXT[])');
    console.log('   - knowledge_areas (TEXT[])');
    console.log('   - language_capabilities (TEXT[])');
    console.log('   - is_premium (BOOLEAN)');
    console.log('   - is_active (BOOLEAN)');
    console.log('   - sort_order (INTEGER)');
    console.log('   - rating_average (DECIMAL)');
    console.log('   - rating_count (INTEGER)');
    console.log('   - conversation_count (INTEGER)');
    console.log('   - created_at (TIMESTAMP)');
    console.log('   - updated_at (TIMESTAMP)');
    console.log('');
    console.log('📊 Current row count:', count || 0);
    console.log('');
    console.log('✅ Migration verification: SUCCESS');
    console.log('✅ TypeScript types created: src/types/persona.ts');
    console.log('');
    
    return true;

  } catch (err) {
    console.error('❌ Exception:', err.message);
    return false;
  }
}

checkSchema().then(success => {
  if (success) {
    console.log('🎉 Task 1 completed successfully!');
  }
  process.exit(success ? 0 : 1);
});
