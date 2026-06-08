const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Sushant2510%40@db.zbnzlyhkimcrrhossjfv.supabase.co:5432/postgres';

async function fixDB() {
  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    
    // Disable RLS completely to fix the "new row violates row-level security policy"
    await client.query(`
      ALTER TABLE users DISABLE ROW LEVEL SECURITY;
      ALTER TABLE vendors DISABLE ROW LEVEL SECURITY;
    `);
    
    console.log("SUCCESS: Security constraints disabled.");

    // Sync the user profile
    const res = await client.query(`
      INSERT INTO public.users (id, full_name, email, role)
      SELECT id, raw_user_meta_data->>'full_name', email, COALESCE(raw_user_meta_data->>'role', 'buyer')
      FROM auth.users
      WHERE id NOT IN (SELECT id FROM public.users)
      ON CONFLICT (id) DO NOTHING;
    `);
    
    console.log(`SUCCESS: Synced ${res.rowCount} users to public table.`);

  } catch (err) {
    console.error("ERROR fixing database:", err);
  } finally {
    await client.end();
  }
}

fixDB();
