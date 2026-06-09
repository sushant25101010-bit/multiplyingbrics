const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^#]+?)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

if (!serviceRoleKey) {
  console.error("ERROR: SUPABASE_SERVICE_ROLE_KEY is required but not found in .env.local.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function seedData() {
  console.log("Starting seed process...");
  
  const filePath = path.join(__dirname, 'pincodes.json');
  
  if (!fs.existsSync(filePath)) {
    console.error("ERROR: pincodes.json not found in the web directory.");
    console.log("Please download it and place it here before running.");
    return;
  }

  try {
    console.log("Reading pincodes.json...");
    const data = fs.readFileSync(filePath, 'utf8');
    const allRecords = JSON.parse(data);
    
    console.log(`Successfully parsed ${allRecords.length || Object.keys(allRecords).length} total records.`);
    
    // Some JSONs use different casing for keys, we normalize it
    const karnatakaRecords = allRecords.filter(r => 
      (r.state_name || r.StateName || r.state || r.stateName || r.CircleName || '').toUpperCase() === 'KARNATAKA'
    );
    
    console.log(`Found ${karnatakaRecords.length} records for Karnataka.`);
    
    if (karnatakaRecords.length === 0) {
      console.log("Could not find Karnataka records. Please check the JSON format.");
      console.log("First record snippet:", JSON.stringify(allRecords[0]));
      return;
    }
    
    console.log("Upserting Karnataka records to prevent duplicates and preserve existing records...");
    
    // Map to our database schema
    const insertData = karnatakaRecords.map(r => ({
      state_name: 'Karnataka',
      district_name: r.district_name || r.District || r.district || r.DistrictName || 'Unknown',
      office_name: r.office_name || r.OfficeName || r.Name || r.office || 'Unknown',
      pincode: (r.pincode || r.Pincode || r.pin || r.Pincode || '').toString()
    }));

    // Batch insert in chunks of 1000 to avoid overloading the API
    const chunkSize = 1000;
    let inserted = 0;
    for (let i = 0; i < insertData.length; i += chunkSize) {
      const chunk = insertData.slice(i, i + chunkSize);
      
      const { error } = await supabase
        .from('indian_locations')
        .upsert(chunk, { 
          onConflict: 'state_name,district_name,office_name,pincode',
          ignoreDuplicates: true 
        });
        
      if (error) {
        console.error("Error upserting chunk:", error);
        break;
      }
      inserted += chunk.length;
      console.log(`Upserted ${inserted} / ${insertData.length}`);
    }
    
    console.log("Seeding complete!");
    
  } catch (err) {
    console.error("Error processing data:", err.message);
  }
}

seedData();
