const { Client } = require('pg');

async function migrate() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Sushant2510%40@db.zbnzlyhkimcrrhossjfv.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.indian_locations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        state_name TEXT NOT NULL,
        district_name TEXT NOT NULL,
        office_name TEXT NOT NULL,
        pincode TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_locations_state ON public.indian_locations(state_name);
      CREATE INDEX IF NOT EXISTS idx_locations_district ON public.indian_locations(state_name, district_name);
      CREATE INDEX IF NOT EXISTS idx_locations_office ON public.indian_locations(district_name, office_name);
      CREATE INDEX IF NOT EXISTS idx_locations_pincode ON public.indian_locations(pincode);

      DO $$ BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'unique_location'
        ) THEN
            ALTER TABLE public.indian_locations 
            ADD CONSTRAINT unique_location UNIQUE (state_name, district_name, office_name, pincode);
        END IF;
      END $$;

      ALTER TABLE public.indian_locations ENABLE ROW LEVEL SECURITY;
      
      -- Drop if exists and recreate policy
      DO $$ BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access to indian_locations' AND tablename = 'indian_locations'
        ) THEN
            CREATE POLICY "Allow public read access to indian_locations"
              ON public.indian_locations FOR SELECT USING (true);
        END IF;
      END $$;
    `);

    console.log("SUCCESS: indian_locations table created successfully.");
  } catch (err) {
    console.error("ERROR:", err);
  } finally {
    await client.end();
  }
}

migrate();
