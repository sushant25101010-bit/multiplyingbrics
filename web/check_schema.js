const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: './.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  const { data, error } = await supabase.from('users').select('avatar_url').limit(1);
  if (error) {
    console.error("Error:", error.message);
  } else {
    console.log("Success! Column exists.");
  }
}

check();
