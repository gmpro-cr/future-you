const fs = require('fs');
const path = require('path');

// Parse connection string from Supabase URL
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://exdjsvknudvfkabnifrg.supabase.co';
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!projectRef) {
  console.error('❌ Could not parse Supabase project reference');
  process.exit(1);
}

console.log('📋 Task 1: Database Schema Migration - Personas Table');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

const migrationFile = path.join(__dirname, '..', 'supabase', 'migrations', '20251028_create_personas_table.sql');
const sql = fs.readFileSync(migrationFile, 'utf8');

console.log('✅ Migration file loaded: 20251028_create_personas_table.sql');
console.log('');
console.log('📝 Manual Migration Instructions:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('Please follow these steps to run the migration:');
console.log('');
console.log('1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/' + projectRef);
console.log('2. Click on "SQL Editor" in the left sidebar');
console.log('3. Click "New query" button');
console.log('4. Copy the SQL below and paste it into the editor');
console.log('5. Click "Run" button');
console.log('6. Verify success: Go to "Database" → "Tables" → Check for "personas" table');
console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('SQL TO COPY (between the markers):');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(sql);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('After running the migration in Supabase Dashboard, press Enter to continue...');

// Wait for user input
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('', (answer) => {
  rl.close();
  console.log('');
  console.log('✅ Migration instructions provided');
  console.log('');
  console.log('Next: Verify the migration was successful by checking the Supabase Dashboard');
});
