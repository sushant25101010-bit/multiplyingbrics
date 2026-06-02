import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()

  try {
    const { role, businessName, adminName, phone, email, password, confirmPassword } = await request.json()

    if (!email || !phone || !password || !confirmPassword || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 })
    }

    if (role === 'vendor' && !businessName) {
      return NextResponse.json({ error: 'Business name is required for vendor signup' }, { status: 400 })
    }

    if (role === 'admin' && !adminName) {
      return NextResponse.json({ error: 'Admin name is required for admin signup' }, { status: 400 })
    }

    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length !== 10) {
      return NextResponse.json({ error: 'Enter a valid 10-digit phone number' }, { status: 400 })
    }
    const formattedPhone = `+91${cleanPhone}`

    let fullName = 'User'
    if (role === 'vendor') {
      fullName = businessName.trim()
    } else if (role === 'admin') {
      fullName = adminName.trim()
    }

    // 1. Sign up the user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          phone: formattedPhone,
          full_name: fullName,
          role,
          business_name: role === 'vendor' ? businessName : undefined,
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
    const { error: dbError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: email,
        phone: formattedPhone,
        full_name: fullName,
        role: role
      }, { onConflict: 'id' })

    if (dbError) {
      console.warn('Upsert on signup warning (likely RLS due to pending email verification):', dbError.message)
    } else if (role === 'vendor') {
      // 3. For vendors, automatically create entry in vendors table.
      const { error: vendorError } = await supabase
        .from('vendors')
        .insert({
          user_id: user.id,
          business_name: businessName,
          status: 'pending'
        })
      if (vendorError) {
        console.warn('Failed to insert vendor profile during signup (likely RLS/pending verification):', vendorError.message)
      }
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
