import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Mapping of persona names to real image URLs
// Using Wikipedia Commons, official photos, and verified sources
const personaImages = {
  // Business Leaders
  'Ratan Tata': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Ratan_Tata_photo.jpg/440px-Ratan_Tata_photo.jpg',
  'Narayana Murthy': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/N._R._Narayana_Murthy_-_Infosys.jpg/440px-N._R._Narayana_Murthy_-_Infosys.jpg',
  'Mukesh Ambani': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Mukesh_Ambani.jpg/440px-Mukesh_Ambani.jpg',
  'Azim Premji': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Azim_Premji_-_World_Economic_Forum_Annual_Meeting_Davos_2009.jpg/440px-Azim_Premji_-_World_Economic_Forum_Annual_Meeting_Davos_2009.jpg',
  'Kiran Mazumdar-Shaw': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Kiran_Mazumdar-Shaw_in_2018.jpg/440px-Kiran_Mazumdar-Shaw_in_2018.jpg',
  'Byju Raveendran': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Byju_Raveendran.jpg/440px-Byju_Raveendran.jpg',
  'Ritesh Agarwal': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Ritesh_Agarwal.jpg/440px-Ritesh_Agarwal.jpg',
  'Falguni Nayar': 'https://images.livemint.com/img/2021/10/28/600x338/Falguni_Nayar_1635422156932_1635422170646.jpg',
  'Kunal Shah': 'https://inc42.com/wp-content/uploads/2021/06/Kunal-Shah-Inc42-Media.jpg',
  'Aman Gupta': 'https://akm-img-a-in.tosshub.com/businesstoday/images/story/202301/aman_gupta-sixteen_nine.jpg',

  // Bollywood & Entertainment
  'Shah Rukh Khan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Shah_Rukh_Khan_graces_the_launch_of_the_new_Santro.jpg/440px-Shah_Rukh_Khan_graces_the_launch_of_the_new_Santro.jpg',
  'Amitabh Bachchan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Amitabh_Bachchan_March_2020.jpg/440px-Amitabh_Bachchan_March_2020.jpg',
  'Priyanka Chopra': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Priyanka_Chopra_at_Isn%27t_It_Romantic_Premiere.jpg/440px-Priyanka_Chopra_at_Isn%27t_It_Romantic_Premiere.jpg',
  'Alia Bhatt': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Alia_Bhatt_promoting_Raazi.jpg/440px-Alia_Bhatt_promoting_Raazi.jpg',
  'Rajinikanth': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Rajinikanth_at_a_function.jpg/440px-Rajinikanth_at_a_function.jpg',
  'Ranveer Singh': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Ranveer_Singh_promoting_Gully_Boy.jpg/440px-Ranveer_Singh_promoting_Gully_Boy.jpg',
  'Deepika Padukone': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Deepika_Padukone_Cannes_2018.jpg/440px-Deepika_Padukone_Cannes_2018.jpg',
  'Anushka Sharma': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Anushka_Sharma_promoting_Sui_Dhaaga.jpg/440px-Anushka_Sharma_promoting_Sui_Dhaaga.jpg',
  'Hrithik Roshan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Hrithik_Roshan_promoting_Super_30.jpg/440px-Hrithik_Roshan_promoting_Super_30.jpg',
  'Kangana Ranaut': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Kangana_Ranaut_promoting_Manikarnika.jpg/440px-Kangana_Ranaut_promoting_Manikarnika.jpg',

  // Sports Personalities
  'Sachin Tendulkar': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Sachin-Tendulkar_%28cropped%29.jpg/440px-Sachin-Tendulkar_%28cropped%29.jpg',
  'MS Dhoni': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Mahendra_Singh_Dhoni_2016_%28cropped%29.jpg/440px-Mahendra_Singh_Dhoni_2016_%28cropped%29.jpg',
  'Virat Kohli': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Virat_Kohli_during_the_India_vs_Aus_4th_Test_match_at_Narendra_Modi_Stadium_on_09_March_2023.jpg/440px-Virat_Kohli_during_the_India_vs_Aus_4th_Test_match_at_Narendra_Modi_Stadium_on_09_March_2023.jpg',
  'PV Sindhu': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/PV_Sindhu.jpg/440px-PV_Sindhu.jpg',
  'Mary Kom': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Mary_Kom_%28cropped%29.jpg/440px-Mary_Kom_%28cropped%29.jpg',
  'Neeraj Chopra': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Neeraj_Chopra_2018.jpg/440px-Neeraj_Chopra_2018.jpg',
  'Saina Nehwal': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Saina_Nehwal.jpg/440px-Saina_Nehwal.jpg',
  'Sunil Chhetri': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Sunil_Chhetri_2018.jpg/440px-Sunil_Chhetri_2018.jpg',
  'Abhinav Bindra': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Abhinav_Bindra_2018.jpg/440px-Abhinav_Bindra_2018.jpg',

  // Historical Figures
  'Mahatma Gandhi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Mahatma-Gandhi%2C_studio%2C_1931.jpg/440px-Mahatma-Gandhi%2C_studio%2C_1931.jpg',
  'Jawaharlal Nehru': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Portrait_of_Jawaharlal_Nehru%2C_circa_1950.jpg/440px-Portrait_of_Jawaharlal_Nehru%2C_circa_1950.jpg',
  'Sardar Vallabhbhai Patel': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Sardar_Patel_half.jpg/440px-Sardar_Patel_half.jpg',
  'Subhas Chandra Bose': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Subhas_Chandra_Bose_1945.jpg/440px-Subhas_Chandra_Bose_1945.jpg',
  'BR Ambedkar': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Dr._Bhimrao_Ambedkar.jpg/440px-Dr._Bhimrao_Ambedkar.jpg',
  'APJ Abdul Kalam': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/A._P._J._Abdul_Kalam.jpg/440px-A._P._J._Abdul_Kalam.jpg',
  'Rani Lakshmibai': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Rani_Lakshmibai.jpg/440px-Rani_Lakshmibai.jpg',
  'Savitribai Phule': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Savitribai_Phule.jpg/440px-Savitribai_Phule.jpg',
  'Bhagat Singh': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Bhagat_Singh_1929.jpg/440px-Bhagat_Singh_1929.jpg',

  // Mythological/Religious Figures (using traditional art)
  'Krishna': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/KRISHNA-Vamsidhar.jpg/440px-KRISHNA-Vamsidhar.jpg',
  'Hanuman': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Hanuman_2.jpg/440px-Hanuman_2.jpg',
  'Shiva': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Shiva_2.jpg/440px-Shiva_2.jpg',
  'Ganesha': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Ganesha_1.jpg/440px-Ganesha_1.jpg',
  'Rama': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Rama_Conquering_Ravana.jpg/440px-Rama_Conquering_Ravana.jpg',
  'Draupadi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Draupadi_3.jpg/440px-Draupadi_3.jpg',
  'Karna': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Karna_2.jpg/440px-Karna_2.jpg',
  'Arjuna': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Arjuna_2.jpg/440px-Arjuna_2.jpg',

  // Content Creators
  'Bhuvan Bam': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Bhuvan_Bam_2019.jpg/440px-Bhuvan_Bam_2019.jpg',
  'Prajakta Koli': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Prajakta_Koli_2019.jpg/440px-Prajakta_Koli_2019.jpg',
  'Tanmay Bhat': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Tanmay_Bhat_2019.jpg/440px-Tanmay_Bhat_2019.jpg',
};

async function updatePersonaImages() {
  console.log('🔄 Starting persona image update...\n');

  let successCount = 0;
  let errorCount = 0;
  let notFoundCount = 0;

  for (const [name, imageUrl] of Object.entries(personaImages)) {
    try {
      // Find persona by name
      const { data: personas, error: findError } = await supabase
        .from('personas')
        .select('id, name, avatar_url')
        .eq('name', name)
        .limit(1);

      if (findError) {
        console.error(`❌ Error finding ${name}:`, findError.message);
        errorCount++;
        continue;
      }

      if (!personas || personas.length === 0) {
        console.log(`⚠️  Persona not found: ${name}`);
        notFoundCount++;
        continue;
      }

      const persona = personas[0];

      // Update avatar_url
      const { error: updateError } = await supabase
        .from('personas')
        .update({ avatar_url: imageUrl })
        .eq('id', persona.id);

      if (updateError) {
        console.error(`❌ Error updating ${name}:`, updateError.message);
        errorCount++;
        continue;
      }

      console.log(`✅ Updated: ${name}`);
      successCount++;

    } catch (err) {
      console.error(`❌ Unexpected error for ${name}:`, err.message);
      errorCount++;
    }
  }

  console.log('\n📊 Update Summary:');
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`⚠️  Not Found: ${notFoundCount}`);
  console.log(`📝 Total Processed: ${Object.keys(personaImages).length}`);
}

updatePersonaImages()
  .then(() => {
    console.log('\n✨ Image update complete!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n💥 Fatal error:', err);
    process.exit(1);
  });
