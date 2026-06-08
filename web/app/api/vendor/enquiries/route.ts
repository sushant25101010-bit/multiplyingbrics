import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = (page - 1) * limit

  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get vendor ID
  const { data: vendor } = await supabase
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!vendor) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
  }

  try {
    const { data: enquiries, count, error } = await supabase
      .from('enquiries')
      .select(`
        *,
        buyer:users(full_name, phone, email),
        listing:listings(
          service_pincodes,
          price_per_unit,
          material:materials(name, unit, image_url)
        )
      `, { count: 'exact' })
      .eq('vendor_id', vendor.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({ enquiries, total: count, page, limit })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
