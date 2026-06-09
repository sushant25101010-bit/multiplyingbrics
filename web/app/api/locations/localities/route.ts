import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    
    if (!city) {
      return NextResponse.json({ error: 'City parameter is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('indian_locations')
      .select('office_name')
      .eq('district_name', city)
    
    if (error) throw error;
    
    const localities = Array.from(new Set(data.map((s: any) => s.office_name))).sort();
    return NextResponse.json(localities);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
