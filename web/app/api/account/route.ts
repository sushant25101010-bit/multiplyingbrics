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

    // 2. Fetch saved vendors
    const { data: savedVendors } = await supabase
      .from('saved_vendors')
      .select('*, vendor:vendors(*)')
      .eq('buyer_id', authUser.id)

    // 3. Fetch enquiry history
    const { data: enquiries } = await supabase
      .from('enquiries')
      .select('*, vendor:vendors(business_name), listing:listings(material:materials(name))')
      .eq('buyer_id', authUser.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({ 
      user, 
      saved_vendors: savedVendors || [], 
      enquiries: enquiries || [] 
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
