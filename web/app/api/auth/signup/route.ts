import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()

  try {
    const { firstName, lastName, phone, email, password } = await request.json()

    if (!firstName || !lastName || !phone || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length !== 10) {
      return NextResponse.json({ error: 'Enter a valid 10-digit phone number' }, { status: 400 })
    }
    const formattedPhone = `+91${cleanPhone}`

    const fullName = `${firstName.trim()} ${lastName.trim()}`

    // 1. Sign up the user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          phone: formattedPhone,
          full_name: fullName,
        }
      }
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const user = data.user
    if (!user) {
      return NextResponse.json({ error: 'Signup failed. Please try again.' }, { status: 400 })
    }

    // 2. Store user information in public.users table.
    // If auto-confirm is enabled, this session is active. If email verification is enabled, 
    // we still try to upsert since the auth.users entry was created. If RLS fails because
    // the user is not authenticated yet, we can catch it. The callback handler will also upsert.
    const { error: dbError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: email,
        phone: formattedPhone,
        full_name: fullName,
        role: 'buyer' // default role
      }, { onConflict: 'id' })

    if (dbError) {
      console.warn('Upsert on signup warning (likely RLS due to pending email verification):', dbError.message)
      // We don't fail signup if they just need to confirm email, because their user record was created in auth.users,
      // and they will be verified and upserted upon clicking the confirmation link.
    }

    const hasSession = !!data.session

    return NextResponse.json({ 
      success: true, 
      user,
      requiresVerification: !hasSession,
      message: hasSession ? 'Signup successful!' : 'Signup successful! Please check your email to verify your account.'
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
