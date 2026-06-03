import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  const cookieStore = cookies()
  const nextCookie = cookieStore.get('auth_next')?.value
  const roleCookie = cookieStore.get('auth_role')?.value
  
  const next = nextCookie ? decodeURIComponent(nextCookie) : '/'

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

        const urlRole = roleCookie
        
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
      let response: NextResponse;
      if (isLocalEnv) {
        response = NextResponse.redirect(`${origin}${redirectPath}`)
      } else if (forwardedHost) {
        response = NextResponse.redirect(`https://${forwardedHost}${redirectPath}`)
      } else {
        response = NextResponse.redirect(`${origin}${redirectPath}`)
      }
      
      response.cookies.delete('auth_next')
      response.cookies.delete('auth_role')
      return response
    } else {
      return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(error.message)}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=No+code+provided`)
}
