const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Sushant2510%40@db.zbnzlyhkimcrrhossjfv.supabase.co:5432/postgres';

async function fixRLS() {
  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    
    // Check existing policies
    const res = await client.query(`
      SELECT policyname, cmd, qual, with_check 
      FROM pg_policies 
      WHERE tablename = 'vendors';
    `);
    console.log('Existing policies on vendors:', res.rows);

    // Create the policy to allow insert
    await client.query(`
      DROP POLICY IF EXISTS "Users can insert their own vendor profile" ON vendors;
      CREATE POLICY "Users can insert their own vendor profile" 
      ON vendors FOR INSERT 
      TO authenticated 
      WITH CHECK (auth.uid() = user_id);
      
      -- Let's also ensure they can read/update their own profile
      DROP POLICY IF EXISTS "Users can view their own vendor profile" ON vendors;
      CREATE POLICY "Users can view their own vendor profile"
      ON vendors FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can update their own vendor profile" ON vendors;
      CREATE POLICY "Users can update their own vendor profile"
      ON vendors FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
      
      -- Let's also ensure everyone can read approved vendors
      DROP POLICY IF EXISTS "Anyone can view approved vendors" ON vendors;
      CREATE POLICY "Anyone can view approved vendors"
      ON vendors FOR SELECT
      USING (status = 'approved');
    `);
    
    console.log("RLS policies updated successfully for vendors table!");
  } catch (err) {
    console.error("Error fixing RLS:", err);
  } finally {
    await client.end();
  }
}

fixRLS();
