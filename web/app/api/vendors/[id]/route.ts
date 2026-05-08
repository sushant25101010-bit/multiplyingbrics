import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  
  // Check auth status
  const { data: { user } } = await supabase.auth.getUser()

  try {
    // 1. Fetch vendor and their associated user details
    const { data: vendor, error: vendorErr } = await supabase
      .from('vendors')
      .select(`
        *,
        owner:users(phone, email)
      `)
      .eq('id', params.id)
      .single()

    if (vendorErr || !vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    // 2. Fetch all listings for this vendor
    const { data: listings } = await supabase
      .from('listings')
      .select('*, material:materials(*)')
      .eq('vendor_id', params.id)
      .eq('in_stock', true)
      .order('created_at', { ascending: false })

    // 3. Prepare response - Gating logic
    const profile = {
      id: vendor.id,
      business_name: vendor.business_name,
      address: vendor.address,
      status: vendor.status,
      created_at: vendor.created_at,
      // Only include contact info if user is logged in
      contact: user ? {
        phone: vendor.owner?.phone,
        email: vendor.owner?.email
      } : null
    }

    return NextResponse.json({ vendor: profile, listings: listings || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
