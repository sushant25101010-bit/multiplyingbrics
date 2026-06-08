import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: vendor } = await supabase.from('vendors').select('id').eq('user_id', user.id).single()
  if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('vendor_pincodes')
    .select('*')
    .eq('vendor_id', vendor.id)
    .order('pincode')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
