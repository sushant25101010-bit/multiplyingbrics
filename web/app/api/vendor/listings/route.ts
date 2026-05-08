import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: vendor } = await supabase.from('vendors').select('id').eq('user_id', user.id).single()
  if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('listings')
    .select('*, material:materials(*)')
    .eq('vendor_id', vendor.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
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
    const { material_id, pincode, price_per_unit, notes } = body

    const { data, error } = await supabase
      .from('listings')
      .insert({
        vendor_id: vendor.id,
        material_id,
        pincode,
        price_per_unit,
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
