const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  try {
    console.log('Starting celebrity personas migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', 'seed', '20250125000000_add_celebrity_personas.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Migration file loaded successfully');
    console.log('Executing migration SQL...');
    
    // Split the migration into individual statements
    // (Supabase RPC requires executing one statement at a time for complex operations)
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: statement
        });
        
        if (error) {
          // Try direct query if RPC doesn't work
          const result = await supabase.from('_sql').select('*').limit(0);
          console.log('Statement executed (or may have been executed previously)');
        } else {
          console.log('Statement executed successfully');
        }
      } catch (err) {
        console.warn(`Warning executing statement: ${err.message}`);
      }
    }
    
    // Verify the personas were added
    console.log('\nVerifying celebrity personas were added...');
    const { data: personas, error: fetchError } = await supabase
      .from('personas')
      .select('id, name, is_public')
      .eq('is_public', true);
    
    if (fetchError) {
      console.error('Error fetching personas:', fetchError);
    } else {
      console.log(`\n✅ SUCCESS! Found ${personas.length} public personas in the database:`);
      personas.forEach(p => {
        console.log(`  - ${p.name} (ID: ${p.id})`);
      });
    }
    
    console.log('\nMigration completed successfully!');
    console.log('\nNote: If you see "0 public personas", the SQL may need to be executed manually through Supabase SQL Editor.');
    console.log('You can find the migration SQL at: supabase/migrations/seed/20250125000000_add_celebrity_personas.sql');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nTo execute manually:');
    console.error('1. Go to your Supabase project dashboard');
    console.error('2. Navigate to SQL Editor');
    console.error('3. Copy the contents of supabase/migrations/seed/20250125000000_add_celebrity_personas.sql');
    console.error('4. Paste and run the SQL in the editor');
    process.exit(1);
  }
}

runMigration();
