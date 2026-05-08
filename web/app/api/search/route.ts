import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const material_id = searchParams.get('material_id')
  const pincode = searchParams.get('pincode')

  if (!material_id || !pincode) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  try {
    const supabase = createClient()

    // 1. Try exact pincode match
    let { data: listings, error } = await supabase
      .from('listings')
      .select(`
        *,
        vendor:vendors(*),
        material:materials(*)
      `)
      .eq('material_id', material_id)
      .eq('pincode', pincode)
      .eq('in_stock', true)
      .eq('vendors.status', 'approved') // Only show approved vendors
      .order('price_per_unit', { ascending: true })

    if (error) throw error

    // 2. Return results (even if empty, the frontend handles empty state)
    return NextResponse.json({ 
      listings: listings || [],
      fallback_pincode: null,
      fallback_area: null
    })
  } catch (error: any) {
    console.error('Search API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
