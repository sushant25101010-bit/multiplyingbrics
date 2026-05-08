import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = createClient()
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'pending'
  
  // 1. Verify admin role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    // 2. Fetch vendors with documents
    const { data: vendors, error } = await supabase
      .from('vendors')
      .select('*, documents(*), owner:users(phone, email, full_name)')
      .eq('status', status)
      .order('created_at', { ascending: true })

    if (error) throw error
    return NextResponse.json(vendors)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
