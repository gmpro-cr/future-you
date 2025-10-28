const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyTable() {
  console.log('🔍 Checking if personas table exists...\n');

  try {
    // Try to query the personas table
    const { data, error } = await supabase
      .from('personas')
      .select('count')
      .limit(1);

    if (error) {
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('❌ Personas table does NOT exist yet');
        console.log('\n📋 Next steps:');
        console.log('1. Go to Supabase Dashboard → SQL Editor');
        console.log('2. Copy the SQL from: supabase/migrations/20251028_create_personas_table.sql');
        console.log('3. Paste and run it in the SQL Editor');
        console.log('4. Run this script again to verify\n');
        return false;
      } else {
        console.log('⚠️  Error checking table:', error.message);
        return false;
      }
    }

    console.log('✅ Personas table EXISTS and is accessible!\n');

    // Get table structure
    const { data: columns } = await supabase
      .from('personas')
      .select('*')
      .limit(0);

    console.log('📊 Table verified successfully');
    return true;

  } catch (err) {
    console.error('❌ Exception:', err.message);
    return false;
  }
}

verifyTable().then(exists => {
  process.exit(exists ? 0 : 1);
});
