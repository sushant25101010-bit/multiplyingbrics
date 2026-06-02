import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()

  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single()

    let role = profile?.role

    // Profile creation fallback for first-time login
    if (!profile) {
      const metadata = data.user.user_metadata || {}
      role = metadata.role || 'buyer'
      
      const fullName = metadata.full_name || 
                       `${metadata.given_name || ''} ${metadata.family_name || ''}`.trim() ||
                       data.user.email?.split('@')[0] || 
                       'User'
      
      await supabase.from('users').upsert({
        id: data.user.id,
        email: data.user.email,
        phone: metadata.phone || data.user.phone || null,
        full_name: fullName,
        role: role
      }, { onConflict: 'id' })

      // Removed vendor upsert to enforce manual onboarding
    }

    return NextResponse.json({ success: true, user: data.user, role })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
