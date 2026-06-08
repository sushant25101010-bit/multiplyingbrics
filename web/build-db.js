const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Sushant2510%40@db.zbnzlyhkimcrrhossjfv.supabase.co:5432/postgres';

async function buildDatabase() {
  const client = new Client({ connectionString });

  try {
    await client.connect();
    
    // Create Documents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.documents (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
        doc_type TEXT NOT NULL,
        storage_path TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);
    console.log("Documents table created.");

    // Create Materials table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.materials (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);
    console.log("Materials table created.");

    // Create Listings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.listings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
        material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
        price NUMERIC,
        unit TEXT,
        min_order NUMERIC,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);
    console.log("Listings table created.");

    // Create Enquiries table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.enquiries (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
        vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
        listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'open',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);
    console.log("Enquiries table created.");

    // Create Saved Vendors table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.saved_vendors (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
        vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        UNIQUE(buyer_id, vendor_id)
      );
    `);
    console.log("Saved vendors table created.");
    
    // Create storage bucket if possible (Requires Supabase API, but we'll ignore for now or use SQL if possible. PostgREST handles storage via storage.buckets)
    await client.query(`
      INSERT INTO storage.buckets (id, name, public) 
      VALUES ('vendor-documents', 'vendor-documents', false)
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log("Storage bucket configured.");

    console.log("SUCCESS: All missing tables have been created!");

  } catch (err) {
    console.error("ERROR building database:", err);
  } finally {
    await client.end();
  }
}

buildDatabase();
