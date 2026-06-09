import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const locality = searchParams.get('locality')
    
    if (!locality) {
      return NextResponse.json({ error: 'Locality parameter is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('indian_locations')
      .select('pincode')
      .eq('office_name', locality)
    
    if (error) throw error;
    
    const pincodes = Array.from(new Set(data.map((s: any) => s.pincode))).sort();
    return NextResponse.json(pincodes);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
