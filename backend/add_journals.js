const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Checking for user 'suzynotsusie'...");
  let { data: users, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('username', 'suzynotsusie')
    .limit(1);

  let userId;

  if (userError) {
    console.error("Error fetching user:", userError);
    process.exit(1);
  }

  if (users && users.length > 0) {
    userId = users[0].id;
    console.log("Found user 'suzynotsusie' with ID:", userId);
  } else {
    console.log("User 'suzynotsusie' not found. Creating...");
    const newUser = {
      username: 'suzynotsusie',
      nickname: 'Suzy',
      role: 'user',
      status: 'offline',
      topics: ["daily", "relationship"]
    };
    
    const { data: insertedUser, error: insertError } = await supabase
      .from('users')
      .insert([newUser])
      .select();

    if (insertError) {
      console.error("Error creating user:", insertError);
      process.exit(1);
    }
    userId = insertedUser[0].id;
    console.log("Created user 'suzynotsusie' with ID:", userId);
  }

  // Generate Base64 encoded journals as per database comments
  // encrypted_content = btoa(content) -> in nodejs: Buffer.from(content).toString('base64')
  const journals = [
    {
      user_id: userId,
      encrypted_content: Buffer.from('Hôm nay đi cà phê một mình, thời tiết rất đẹp, tự nhiên thấy lòng nhẹ bẫng. Một ngày tuyệt vời.').toString('base64'),
      mood: 'great'
    },
    {
      user_id: userId,
      encrypted_content: Buffer.from('Dự án hôm nay gặp vấn đề lớn. Sếp thì cằn nhằn, đồng nghiệp thì đùn đẩy trách nhiệm. Cảm thấy mệt mỏi và kiệt sức quá.').toString('base64'),
      mood: 'tired'
    },
    {
      user_id: userId,
      encrypted_content: Buffer.from('Vừa cãi nhau với người yêu xong. Mọi chuyện vốn chẳng có gì mà do mình quá nhạy cảm. Giờ thấy hối hận và buồn rũ rượi.').toString('base64'),
      mood: 'anxious'
    }
  ];

  console.log("Inserting 3 journals...");
  const { data: journalData, error: journalError } = await supabase
    .from('journals')
    .insert(journals)
    .select();

  if (journalError) {
    console.error("Error inserting journals:", journalError);
  } else {
    console.log("Successfully inserted 3 journals for user suzynotsusie.");
    console.log(journalData);
  }
}

run();
