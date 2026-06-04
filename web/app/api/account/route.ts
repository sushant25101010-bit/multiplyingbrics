import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
  if (authError || !authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 1. Fetch user profile
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    // Add Google profile image to user object as fallback
    const googleAvatar = authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null;
    const enrichedUser = { ...user, google_avatar: googleAvatar };

    let result: any = { user: enrichedUser, saved_vendors: [], enquiries: [] };

    if (user.role === 'buyer') {
      // Fetch saved vendors and enquiries for buyers
      const { data: savedVendors } = await supabase
        .from('saved_vendors')
        .select('*, vendor:vendors(*)')
        .eq('buyer_id', authUser.id)

      const { data: enquiries } = await supabase
        .from('enquiries')
        .select('*, vendor:vendors(business_name), listing:listings(material:materials(name))')
        .eq('buyer_id', authUser.id)
        .order('created_at', { ascending: false })
      
      result.saved_vendors = savedVendors || [];
      result.enquiries = enquiries || [];
    } else if (user.role === 'vendor') {
      // Fetch vendor info
      const { data: vendor } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', authUser.id)
        .single()
      
      let listingsCount = 0;
      if (vendor) {
        const { count } = await supabase
          .from('listings')
          .select('*', { count: 'exact', head: true })
          .eq('vendor_id', vendor.id)
        listingsCount = count || 0;
      }
      
      result.vendor = vendor;
      result.stats = { total_listings: listingsCount };
    } else if (user.role === 'admin') {
      // Fetch admin stats
      const { count: vendorsCount } = await supabase.from('vendors').select('*', { count: 'exact', head: true })
      const { count: pendingVendorsCount } = await supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      const { count: listingsCount } = await supabase.from('listings').select('*', { count: 'exact', head: true })
      const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true })
      
      result.stats = {
        total_vendors: vendorsCount || 0,
        pending_vendors: pendingVendorsCount || 0,
        total_listings: listingsCount || 0,
        total_users: usersCount || 0
      };
    }

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
