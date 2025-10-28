import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verify() {
  // Get total count
  const { count, error: countError } = await supabase
    .from('personas')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Error getting count:', countError);
    return;
  }

  console.log('\n📊 VERIFICATION SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total personas in database: ${count}`);
  console.log('');

  // Get sample persona
  const { data: sample, error: sampleError } = await supabase
    .from('personas')
    .select('*')
    .eq('name', 'Ratan Tata')
    .single();

  if (sampleError) {
    console.error('Error getting sample:', sampleError);
    return;
  }

  if (sample) {
    console.log('SAMPLE PERSONA: Ratan Tata');
    console.log('='.repeat(80));
    console.log(`Name: ${sample.name}`);
    console.log(`Slug: ${sample.slug}`);
    console.log(`Category: ${sample.category}`);
    console.log(`Short Description: ${sample.short_description}`);
    console.log('');
    console.log(`Bio (first 200 chars):`);
    console.log(`  ${sample.bio.substring(0, 200)}...`);
    console.log('');
    console.log(`Personality Traits: ${sample.personality_traits.join(', ')}`);
    console.log('');
    console.log('Conversation Starters:');
    sample.conversation_starters.forEach((s: string, i: number) => {
      console.log(`  ${i + 1}. ${s}`);
    });
    console.log('');
    console.log(`Tags: ${sample.tags.join(', ')}`);
    console.log(`Knowledge Areas: ${sample.knowledge_areas.join(', ')}`);
    console.log('');
    console.log('System Prompt (first 300 chars):');
    console.log(`  ${sample.system_prompt.substring(0, 300)}...`);
    console.log('');
  }

  // Get category breakdown
  const { data: allPersonas, error: allError } = await supabase
    .from('personas')
    .select('name, category')
    .order('sort_order');

  if (allError) {
    console.error('Error getting all personas:', allError);
    return;
  }

  const categoryBreakdown: Record<string, string[]> = {};
  allPersonas?.forEach(p => {
    if (!categoryBreakdown[p.category]) {
      categoryBreakdown[p.category] = [];
    }
    categoryBreakdown[p.category].push(p.name);
  });

  console.log('='.repeat(80));
  console.log('CATEGORY BREAKDOWN:');
  console.log('='.repeat(80));
  Object.entries(categoryBreakdown).forEach(([category, names]) => {
    console.log(`\n${category.toUpperCase()} (${names.length} personas):`);
    names.forEach((name, i) => {
      console.log(`  ${i + 1}. ${name}`);
    });
  });
  console.log('');
  console.log('='.repeat(80));
}

verify()
  .then(() => {
    console.log('✅ Verification complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });
