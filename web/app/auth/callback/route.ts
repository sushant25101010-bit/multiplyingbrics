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
      
      let redirectPath = next

      if (user) {
        const fullName = user.user_metadata?.full_name || 
                         `${user.user_metadata?.given_name || ''} ${user.user_metadata?.family_name || ''}`.trim() ||
                         user.email?.split('@')[0] || 
                         'Google User'

        const urlRole = searchParams.get('role')
        
        const { data: existingUser } = await supabase.from('users').select('role').eq('id', user.id).single()
        const finalRole = existingUser?.role || urlRole || user.user_metadata?.role || 'buyer'

        // Upsert user profile into public.users.
        await supabase.from('users').upsert({
          id: user.id,
          email: user.email,
          phone: user.phone || user.user_metadata?.phone || null,
          full_name: fullName,
          role: finalRole
        }, { onConflict: 'id' })

        if (redirectPath === '/') {
          if (finalRole === 'admin') {
            redirectPath = '/admin/vendors'
          } else if (finalRole === 'vendor') {
            redirectPath = '/vendor/dashboard'
          } else {
            redirectPath = '/account'
          }
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectPath}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`)
      } else {
        return NextResponse.redirect(`${origin}${redirectPath}`)
      }
    } else {
      return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(error.message)}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=No+code+provided`)
}
