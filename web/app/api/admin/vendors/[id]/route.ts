import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify admin
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const { action, rejection_note } = await request.json()

    // Proxy to the Edge Function (uses Service Role Key to bypass RLS and update roles)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    // We pass the admin's own JWT token so the Edge Function can verify they are truly an admin
    const authHeader = request.headers.get('Authorization')

    const response = await fetch(`${supabaseUrl}/functions/v1/approve-vendor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        vendor_id: params.id,
        action,
        rejection_note
      }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Operation failed')

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
