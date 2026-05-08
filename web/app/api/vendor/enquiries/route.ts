import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
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
    const { data: enquiries, error } = await supabase
      .from('enquiries')
      .select(`
        *,
        buyer:users(full_name, phone),
        listing:listings(
          pincode, 
          material:materials(name, unit)
        )
      `)
      .eq('vendor_id', vendor.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ enquiries })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
