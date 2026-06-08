import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get vendor profile
  const { data: vendor, error: vendorErr } = await supabase
    .from('vendors')
    .select('id, status')
    .eq('user_id', user.id)
    .single()

  if (vendorErr || !vendor) {
    return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 })
  }

  try {
    // 1. Total Listings
    const { count: listingsCount } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', vendor.id)

    // 1b. Active Listings
    const { count: activeListingsCount } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', vendor.id)
      .eq('status', 'active')

    // 1c. Out of Stock Listings
    const { count: outOfStockCount } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', vendor.id)
      .eq('in_stock', false)

    // 2. Active Pincodes
    const { count: pincodesCount } = await supabase
      .from('vendor_pincodes')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', vendor.id)

    // 3. New Enquiries (Open)
    const { count: openEnquiriesCount } = await supabase
      .from('enquiries')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', vendor.id)
      .eq('status', 'open')

    // 3b. Total Enquiries
    const { count: totalEnquiriesCount } = await supabase
      .from('enquiries')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', vendor.id)

    return NextResponse.json({
      stats: {
        total_listings: listingsCount || 0,
        active_listings: activeListingsCount || 0,
        out_of_stock: outOfStockCount || 0,
        open_enquiries: openEnquiriesCount || 0,
        total_enquiries: totalEnquiriesCount || 0,
        pincodes_served: pincodesCount || 0
      },
      vendor_status: vendor.status
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
