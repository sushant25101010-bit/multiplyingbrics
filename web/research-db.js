const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Sushant2510%40@db.zbnzlyhkimcrrhossjfv.supabase.co:5432/postgres';

async function researchDB() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    
    // Check listings schema
    const listingsSchema = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'listings';
    `);
    console.log("Listings:", listingsSchema.rows);

  } catch (err) {
    console.error("ERROR:", err);
  } finally {
    await client.end();
  }
}

researchDB();
