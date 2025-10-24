#!/usr/bin/env node

/**
 * Test Supabase Backend Data Storage
 * This script verifies that:
 * 1. Supabase tables exist and are accessible
 * 2. User data is being saved
 * 3. Personas are being persisted
 * 4. Conversations are being stored
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔍 Testing Supabase Backend Data Storage\n');
console.log('=' .repeat(60));

async function testTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error && error.code === '42P01') {
      console.log(`❌ Table '${tableName}' does NOT exist`);
      console.log(`   Error: ${error.message}`);
      return false;
    } else if (error) {
      console.log(`⚠️  Table '${tableName}' exists but query failed`);
      console.log(`   Error: ${error.message}`);
      return false;
    } else {
      console.log(`✅ Table '${tableName}' exists`);
      return true;
    }
  } catch (err) {
    console.log(`❌ Failed to check table '${tableName}'`);
    console.log(`   Error: ${err.message}`);
    return false;
  }
}

async function testUsers() {
  console.log('\n📊 USERS TABLE');
  console.log('-'.repeat(60));

  const exists = await testTableExists('users');
  if (!exists) {
    console.log('⚠️  Run the schema SQL to create the table');
    return;
  }

  try {
    // Get all users
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.log(`❌ Error fetching users: ${error.message}`);
      return;
    }

    console.log(`\n📈 Total users: ${users.length}`);

    if (users.length === 0) {
      console.log('ℹ️  No users found yet. Sign in with Google to create a user.');
    } else {
      console.log('\n👥 User Data:');
      users.forEach((user, index) => {
        console.log(`\n  User ${index + 1}:`);
        console.log(`    ID: ${user.id}`);
        console.log(`    Name: ${user.name}`);
        console.log(`    Email: ${user.email}`);
        console.log(`    Google ID: ${user.google_id}`);
        console.log(`    Email Verified: ${user.email_verified}`);
        console.log(`    Locale: ${user.locale || 'N/A'}`);
        console.log(`    Profession: ${user.profession || 'N/A'}`);
        console.log(`    Country: ${user.country || 'N/A'}`);
        console.log(`    Created: ${new Date(user.created_at).toLocaleString()}`);
        console.log(`    Updated: ${new Date(user.updated_at).toLocaleString()}`);
      });
    }
  } catch (err) {
    console.log(`❌ Error: ${err.message}`);
  }
}

async function testPersonas() {
  console.log('\n📊 PERSONAS TABLE');
  console.log('-'.repeat(60));

  const exists = await testTableExists('personas');
  if (!exists) {
    console.log('⚠️  Run the schema SQL to create the table');
    return;
  }

  try {
    // Get all personas with user info
    const { data: personas, error } = await supabase
      .from('personas')
      .select(`
        *,
        users (
          name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.log(`❌ Error fetching personas: ${error.message}`);
      return;
    }

    console.log(`\n📈 Total personas: ${personas.length}`);

    if (personas.length === 0) {
      console.log('ℹ️  No personas found yet. Create a persona to see it here.');
    } else {
      console.log('\n🎭 Persona Data:');
      personas.forEach((persona, index) => {
        console.log(`\n  Persona ${index + 1}:`);
        console.log(`    ID: ${persona.id}`);
        console.log(`    Name: ${persona.name}`);
        console.log(`    Description: ${persona.description}`);
        console.log(`    Emoji: ${persona.emoji || 'N/A'}`);
        console.log(`    Owner: ${persona.users?.name} (${persona.users?.email})`);
        console.log(`    Created: ${new Date(persona.created_at).toLocaleString()}`);
        console.log(`    System Prompt: ${persona.system_prompt.substring(0, 100)}...`);
      });
    }
  } catch (err) {
    console.log(`❌ Error: ${err.message}`);
  }
}

async function testConversations() {
  console.log('\n📊 CONVERSATIONS TABLE');
  console.log('-'.repeat(60));

  const exists = await testTableExists('conversations');
  if (!exists) {
    console.log('⚠️  Run the schema SQL to create the table');
    return;
  }

  try {
    // Get all conversations with user and persona info
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        *,
        users (
          name,
          email
        ),
        personas (
          name
        )
      `)
      .order('updated_at', { ascending: false });

    if (error) {
      console.log(`❌ Error fetching conversations: ${error.message}`);
      return;
    }

    console.log(`\n📈 Total conversations: ${conversations.length}`);

    if (conversations.length === 0) {
      console.log('ℹ️  No conversations found yet. Start chatting to see conversations.');
    } else {
      console.log('\n💬 Conversation Data:');
      conversations.forEach((conv, index) => {
        console.log(`\n  Conversation ${index + 1}:`);
        console.log(`    ID: ${conv.id}`);
        console.log(`    User: ${conv.users?.name} (${conv.users?.email})`);
        console.log(`    Persona: ${conv.personas?.name}`);
        console.log(`    Message Count: ${conv.messages?.length || 0}`);
        console.log(`    Created: ${new Date(conv.created_at).toLocaleString()}`);
        console.log(`    Last Updated: ${new Date(conv.updated_at).toLocaleString()}`);

        if (conv.messages && conv.messages.length > 0) {
          console.log(`    Latest Message:`);
          const lastMsg = conv.messages[conv.messages.length - 1];
          console.log(`      Role: ${lastMsg.role}`);
          console.log(`      Content: ${lastMsg.content?.substring(0, 100)}...`);
        }
      });
    }
  } catch (err) {
    console.log(`❌ Error: ${err.message}`);
  }
}

async function testRLS() {
  console.log('\n🔒 ROW LEVEL SECURITY (RLS) TEST');
  console.log('-'.repeat(60));

  try {
    // Test with anon key (should be blocked)
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const anonClient = createClient(supabaseUrl, anonKey);

    const { data, error } = await anonClient
      .from('users')
      .select('*')
      .limit(1);

    if (error) {
      console.log('✅ RLS is working: Anon key is blocked from direct access');
      console.log(`   Error: ${error.message}`);
    } else if (data && data.length > 0) {
      console.log('⚠️  RLS might not be configured correctly');
      console.log('   Anon key can access data directly (should be blocked)');
    } else {
      console.log('✅ RLS is working: No data returned with anon key');
    }
  } catch (err) {
    console.log(`ℹ️  RLS test skipped: ${err.message}`);
  }
}

async function runAllTests() {
  try {
    await testUsers();
    await testPersonas();
    await testConversations();
    await testRLS();

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Backend Data Check Complete!\n');
    console.log('📝 NEXT STEPS:');
    console.log('   1. If tables don\'t exist, run: supabase-schema.sql');
    console.log('   2. Sign in with Google at: http://localhost:3000');
    console.log('   3. Create a persona and start chatting');
    console.log('   4. Run this script again to verify data is being saved\n');
  } catch (error) {
    console.log(`\n❌ Test failed: ${error.message}`);
    process.exit(1);
  }
}

runAllTests();
