import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  
  // 1. Verify admin role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const { data: listings, error } = await supabase
      .from('listings')
      .select('*, vendor:vendors(business_name), material:materials(name, unit)')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(listings)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
