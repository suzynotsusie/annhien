const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Fetching user suzynotsusie...");
  let { data: users } = await supabase.from('users').select('id').eq('username', 'suzynotsusie').single();
  
  if (!users) {
    console.log("User not found!");
    return;
  }
  
  const userId = users.id;
  
  console.log("Deleting old journals for suzynotsusie...");
  await supabase.from('journals').delete().eq('user_id', userId);
  
  const journals = [
    {
      user_id: userId,
      encrypted_content: Buffer.from(encodeURIComponent('Hôm nay đi cà phê một mình, thời tiết rất đẹp, tự nhiên thấy lòng nhẹ bẫng. Một ngày tuyệt vời.')).toString('base64'),
      mood: 'great'
    },
    {
      user_id: userId,
      encrypted_content: Buffer.from(encodeURIComponent('Dự án hôm nay gặp vấn đề lớn. Sếp thì cằn nhằn, đồng nghiệp thì đùn đẩy trách nhiệm. Cảm thấy mệt mỏi và kiệt sức quá.')).toString('base64'),
      mood: 'tired'
    },
    {
      user_id: userId,
      encrypted_content: Buffer.from(encodeURIComponent('Vừa cãi nhau với người yêu xong. Mọi chuyện vốn chẳng có gì mà do mình quá nhạy cảm. Giờ thấy hối hận và buồn rũ rượi.')).toString('base64'),
      mood: 'anxious'
    }
  ];
  
  console.log("Inserting fixed journals...");
  const { data, error } = await supabase.from('journals').insert(journals).select();
  
  if (error) {
    console.error("Error inserting:", error);
  } else {
    console.log("Successfully fixed journals!");
  }
}

run();
