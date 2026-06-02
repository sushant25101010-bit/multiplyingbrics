import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Fetch authenticated user info
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const fullName = user.user_metadata?.full_name || 
                         `${user.user_metadata?.given_name || ''} ${user.user_metadata?.family_name || ''}`.trim() ||
                         user.email?.split('@')[0] || 
                         'Google User'

        const role = user.user_metadata?.role || 'buyer'
        const businessName = user.user_metadata?.business_name

        // Upsert user profile into public.users.
        await supabase.from('users').upsert({
          id: user.id,
          email: user.email,
          phone: user.phone || user.user_metadata?.phone || null,
          full_name: fullName,
          role: role
        }, { onConflict: 'id' })

        // Removed vendor upsert to enforce manual onboarding
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    } else {
      return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(error.message)}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=No+code+provided`)
}
