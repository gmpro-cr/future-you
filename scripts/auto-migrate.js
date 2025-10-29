const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

// Read migration SQL
const migrationSQL = fs.readFileSync(
  path.join(__dirname, 'migration-sql-to-run.sql'),
  'utf8'
);

// Use Supabase REST API with SQL execution
const postData = JSON.stringify({
  query: migrationSQL
});

const options = {
  hostname: `${projectRef}.supabase.co`,
  port: 443,
  path: '/rest/v1/rpc/exec',
  method: 'POST',
  headers: {
    'apikey': supabaseServiceKey,
    'Authorization': `Bearer ${supabaseServiceKey}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Prefer': 'return=representation'
  }
};

console.log('🚀 Attempting automated migration via Supabase REST API...\n');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ Migration executed successfully!');
      console.log('\nRunning verification...\n');
      
      // Run verification
      require('./verify-personas-migration.js');
    } else {
      console.log(`❌ Migration failed with status: ${res.statusCode}`);
      console.log('Response:', data);
      console.log('\n⚠️  Automated migration not available.');
      console.log('Please run migration manually via Supabase Dashboard.');
      console.log('See: scripts/migration-sql-to-run.sql\n');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
  console.log('\n⚠️  Automated migration failed.');
  console.log('Please run migration manually via Supabase Dashboard.');
  console.log('See: scripts/migration-sql-to-run.sql\n');
});

req.write(postData);
req.end();
