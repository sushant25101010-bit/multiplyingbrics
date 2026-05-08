import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()

  try {
    const { phone, token } = await request.json()

    if (!phone || !token) {
      return NextResponse.json({ error: 'Phone and OTP are required' }, { status: 400 })
    }

    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms'
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Ensure the user exists in our public.users table (trigger usually handles this, 
    // but we can do a manual upsert here if needed to be safe).
    const { user } = data
    if (user) {
       await supabase.from('users').upsert({
         id: user.id,
         phone: user.phone,
         role: 'buyer' // Default role
       }, { onConflict: 'id' })
    }

    return NextResponse.json({ success: true, user: data.user })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
