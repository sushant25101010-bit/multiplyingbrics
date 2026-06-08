const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Sushant2510%40@db.zbnzlyhkimcrrhossjfv.supabase.co:5432/postgres';

async function checkSchema() {
  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'vendors';
    `);
    
    console.log("Vendors columns:", res.rows);
    
    const pol = await client.query(`
      SELECT policyname, cmd, qual, with_check 
      FROM pg_policies 
      WHERE tablename = 'vendors';
    `);
    console.log("Vendors policies:", pol.rows);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

checkSchema();
