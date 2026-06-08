import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = (page - 1) * limit

  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: vendor } = await supabase.from('vendors').select('id').eq('user_id', user.id).single()
  if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

  const { data, count, error } = await supabase
    .from('listings')
    .select('*, material:materials(*)', { count: 'exact' })
    .eq('vendor_id', vendor.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ listings: data, total: count, page, limit })
}

export async function POST(request: Request) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id, status')
    .eq('user_id', user.id)
    .single()

  if (!vendor || vendor.status !== 'approved') {
    return NextResponse.json({ error: 'Only approved vendors can create listings' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { 
      material_id, 
      price_per_unit, 
      notes, 
      available_stock, 
      delivery_availability, 
      service_pincodes,
      in_stock
    } = body

    const { data, error } = await supabase
      .from('listings')
      .insert({
        vendor_id: vendor.id,
        material_id,
        price_per_unit,
        available_stock: available_stock || 0,
        delivery_availability: delivery_availability ?? true,
        service_pincodes: service_pincodes || [],
        in_stock: in_stock ?? true,
        notes
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
