import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Export all prompts to a JSON file for editing
async function exportPromptsForEditing() {
  console.log('📥 Exporting persona prompts...\n');
  
  const { data, error } = await supabase
    .from('personas')
    .select('id, name, category, system_prompt')
    .order('category, name');

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  const exportData = {
    exported_at: new Date().toISOString(),
    total_personas: data.length,
    instructions: 'Edit the system_prompt field for each persona, then run: node scripts/edit-persona-prompts.js import',
    personas: data
  };

  writeFileSync('persona-prompts-export.json', JSON.stringify(exportData, null, 2));
  console.log(`✅ Exported ${data.length} persona prompts to: persona-prompts-export.json`);
  console.log('\n📝 To edit:');
  console.log('   1. Open persona-prompts-export.json in your editor');
  console.log('   2. Edit the "system_prompt" field for any persona');
  console.log('   3. Save the file');
  console.log('   4. Run: node scripts/edit-persona-prompts.js import\n');
}

// Import edited prompts back to database
async function importEditedPrompts() {
  console.log('📤 Importing edited prompts...\n');
  
  let fileData;
  try {
    fileData = JSON.parse(readFileSync('persona-prompts-export.json', 'utf8'));
  } catch (err) {
    console.error('❌ Error reading file:', err.message);
    console.log('💡 Run export first: node scripts/edit-persona-prompts.js export');
    return;
  }

  let updated = 0;
  let errors = 0;

  for (const persona of fileData.personas) {
    const { error } = await supabase
      .from('personas')
      .update({ system_prompt: persona.system_prompt })
      .eq('id', persona.id);

    if (error) {
      console.error(`❌ Error updating ${persona.name}:`, error.message);
      errors++;
    } else {
      console.log(`✅ Updated: ${persona.name}`);
      updated++;
    }
  }

  console.log(`\n📊 Results:`);
  console.log(`   ✅ Updated: ${updated}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📝 Total: ${fileData.personas.length}\n`);
}

// Update a single persona prompt
async function updateSinglePrompt(personaName, newPrompt) {
  console.log(`📝 Updating prompt for: ${personaName}\n`);
  
  const { data, error } = await supabase
    .from('personas')
    .update({ system_prompt: newPrompt })
    .eq('name', personaName)
    .select('name, system_prompt');

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  if (data.length === 0) {
    console.error(`❌ Persona "${personaName}" not found`);
    return;
  }

  console.log(`✅ Updated ${data[0].name}`);
  console.log(`📏 New prompt length: ${data[0].system_prompt.length} characters\n`);
}

// Main
const command = process.argv[2];

if (command === 'export') {
  exportPromptsForEditing();
} else if (command === 'import') {
  importEditedPrompts();
} else if (command === 'update' && process.argv[3] && process.argv[4]) {
  updateSinglePrompt(process.argv[3], process.argv[4]);
} else {
  console.log('🎯 Persona Prompt Editor\n');
  console.log('Usage:');
  console.log('  node scripts/edit-persona-prompts.js export          # Export all prompts to JSON');
  console.log('  node scripts/edit-persona-prompts.js import          # Import edited prompts from JSON');
  console.log('  node scripts/edit-persona-prompts.js update "Name" "New prompt"  # Update single prompt\n');
  console.log('Examples:');
  console.log('  node scripts/edit-persona-prompts.js export');
  console.log('  # Edit persona-prompts-export.json');
  console.log('  node scripts/edit-persona-prompts.js import\n');
}
