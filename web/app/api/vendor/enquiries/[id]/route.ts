import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get vendor ID to ensure ownership
  const { data: vendor } = await supabase
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!vendor) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
  }

  try {
    const { status } = await request.json()

    if (!['open', 'responded', 'closed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('enquiries')
      .update({ status })
      .eq('id', params.id)
      .eq('vendor_id', vendor.id) // Security check
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, enquiry: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
