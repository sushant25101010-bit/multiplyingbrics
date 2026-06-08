import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { business_name, gst_number, address } = body

    if (!business_name) {
      return NextResponse.json({ error: 'Business name is required' }, { status: 400 })
    }

    // Ensure the user exists in public.users before referencing it
    const { data: existingUser } = await supabase.from('users').select('id').eq('id', user.id).single();
    if (!existingUser) {
      await supabase.from('users').insert({
        id: user.id,
        full_name: user.user_metadata?.full_name || 'User',
        email: user.email,
        role: user.user_metadata?.role || 'buyer'
      });
    }

    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .insert({
        user_id: user.id,
        business_name,
        gst_number: gst_number || null,
        address: address || null,
        status: 'pending'
      })
      .select()
      .single()

    if (vendorError) {
      if (vendorError.code === '23505') {
         return NextResponse.json({ error: 'You are already registered as a vendor.' }, { status: 400 })
      }
      throw vendorError
    }

    return NextResponse.json({ success: true, vendor })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
