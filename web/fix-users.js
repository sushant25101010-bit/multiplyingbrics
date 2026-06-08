const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Sushant2510%40@db.zbnzlyhkimcrrhossjfv.supabase.co:5432/postgres';

async function fixUsersRLS() {
  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    
    // Create the policy to allow insert on users
    await client.query(`
      DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
      CREATE POLICY "Users can insert their own profile" 
      ON users FOR INSERT 
      WITH CHECK (auth.uid() = id);

      DROP POLICY IF EXISTS "Users can update their own profile" ON users;
      CREATE POLICY "Users can update their own profile" 
      ON users FOR UPDATE
      USING (auth.uid() = id);

      DROP POLICY IF EXISTS "Anyone can read profiles" ON users;
      CREATE POLICY "Anyone can read profiles" 
      ON users FOR SELECT
      USING (true);
    `);
    
    console.log("RLS policies updated successfully for users table!");

    // Also, we need to manually insert the missing user row to fix the current user's state.
    // Let's copy from auth.users to public.users where missing
    const res = await client.query(`
      INSERT INTO public.users (id, full_name, email, role)
      SELECT id, raw_user_meta_data->>'full_name', email, COALESCE(raw_user_meta_data->>'role', 'buyer')
      FROM auth.users
      WHERE id NOT IN (SELECT id FROM public.users)
      ON CONFLICT (id) DO NOTHING;
    `);
    
    console.log(`Synced ${res.rowCount} missing users from auth.users to public.users`);

  } catch (err) {
    console.error("Error fixing Users RLS:", err);
  } finally {
    await client.end();
  }
}

fixUsersRLS();
