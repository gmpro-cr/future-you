const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkExisting() {
  console.log('🔍 Checking existing personas table schema...\n');

  try {
    // Try to get any row to see the structure
    const { data, error } = await supabase
      .from('personas')
      .select('*')
      .limit(1);

    if (error) {
      console.log('Error:', error.message);
      return;
    }

    if (data && data.length > 0) {
      console.log('📊 Existing columns found:');
      const columns = Object.keys(data[0]);
      columns.forEach(col => console.log('   -', col));
    } else {
      console.log('📊 Table exists but is empty. Attempting to query schema...');
      
      // Try querying with no filters to see error
      const { error: schemaError } = await supabase
        .from('personas')
        .select('*')
        .limit(0);
        
      if (schemaError) {
        console.log('Schema query error:', schemaError.message);
      }
    }

  } catch (err) {
    console.error('❌ Exception:', err.message);
  }
}

checkExisting();
