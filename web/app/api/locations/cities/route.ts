import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const state = searchParams.get('state')
    
    if (!state) {
      return NextResponse.json({ error: 'State parameter is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('indian_locations')
      .select('district_name')
      .eq('state_name', state)
    
    if (error) throw error;
    
    const cities = Array.from(new Set(data.map((s: any) => s.district_name))).sort();
    return NextResponse.json(cities);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
