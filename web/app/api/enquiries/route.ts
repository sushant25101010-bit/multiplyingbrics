import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { vendor_id, listing_id, message } = await request.json()

    if (!vendor_id || !message) {
      return NextResponse.json({ error: 'Vendor and message are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('enquiries')
      .insert({
        buyer_id: user.id,
        vendor_id,
        listing_id,
        message,
        status: 'open'
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
