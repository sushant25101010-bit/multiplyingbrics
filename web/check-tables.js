require('dotenv').config({ path: '.env.local' })
const { Client } = require('pg')

async function checkTables() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })
  
  try {
    await client.connect()
    
    // Get all tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `)
    
    console.log("TABLES:")
    for (const row of res.rows) {
      console.log("- " + row.table_name)
      
      // If table name looks like geographic data, get columns
      if (['states', 'cities', 'localities', 'pincodes', 'locations', 'areas'].includes(row.table_name.toLowerCase())) {
        const colRes = await client.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = $1
        `, [row.table_name])
        console.log(`  Columns for ${row.table_name}:`)
        for (const col of colRes.rows) {
          console.log(`    ${col.column_name} (${col.data_type})`)
        }
      }
    }
  } catch (err) {
    console.error("Error:", err)
  } finally {
    await client.end()
  }
}

checkTables()
