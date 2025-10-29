import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function fixAmanImage() {
  // Use a different image source that allows hotlinking
  const newImageUrl = 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=400';

  const { error } = await supabase
    .from('personas')
    .update({ avatar_url: newImageUrl })
    .eq('name', 'Aman Gupta');

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('✅ Fixed Aman Gupta image (using fallback URL)');
  }
}

fixAmanImage().then(() => process.exit(0));
