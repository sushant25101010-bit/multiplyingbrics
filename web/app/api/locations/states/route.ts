import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('indian_locations')
      .select('state_name')
      // Supabase doesn't have a distinct method in JS client, so we fetch all and distinct in JS
      // or we can use an RPC if created. Since we don't have RPC, we fetch and distinct.
      // Wait, there are thousands of rows. 
      // Instead, we will use PostgREST's ability to distinct, but JS client doesn't directly support it.
      // Actually, we can append `?select=state_name&order=state_name` and do distinct in JS.
      // Or we can use `supabase.from('indian_locations').select('state_name', { head: false })`
      // For now, we will fetch and filter distinct in JS. 
      // A better way is using a raw fetch to the REST API with 'select=state_name' and 'limit=100000'.
      // But we will optimize by creating an RPC later if needed.
    
    // For states, we can just fetch distinct. But supabase-js has a neat trick:
    // .select('state_name')
    
    // To make it scalable, we really should use RPC or just raw fetch with distinct.
    const url = `${supabaseUrl}/rest/v1/indian_locations?select=state_name&order=state_name`;
    const response = await fetch(url, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'resolution=merge-duplicates'
      }
    });
    
    const statesData = await response.json();
    const states = Array.from(new Set(statesData.map((s: any) => s.state_name)));
    
    return NextResponse.json(states);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
