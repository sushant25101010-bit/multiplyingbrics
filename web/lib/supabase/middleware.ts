import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          supabaseResponse = NextResponse.next({
            request,
          })
          supabaseResponse.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          supabaseResponse = NextResponse.next({
            request,
          })
          supabaseResponse.cookies.set({ name, value: '', ...options })
        },
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const path = url.pathname

  const isAuthPage = path.startsWith('/auth')
  const isApiRoute = path.startsWith('/api')
  const isProtectedRoute = 
    path.startsWith('/account') || 
    path.startsWith('/vendor') || 
    path.startsWith('/admin')

  // API routes and OAuth callback route validate/exchange auth internally, 
  // we just let them pass through the middleware.
  if (isApiRoute || path === '/auth/callback') {
    return supabaseResponse
  }

  // 1. Unauthenticated users trying to access protected routes
  if (!user && isProtectedRoute) {
    url.pathname = '/auth'
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }

  if (user) {
    // If logged in and trying to access auth page, redirect to account or intended dest
    if (isAuthPage) {
      url.pathname = '/account'
      return NextResponse.redirect(url)
    }

    // 2. Fetch user role for granular permissions
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'buyer'

    // 3. Admin routes require 'admin' role
    if (path.startsWith('/admin') && role !== 'admin') {
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    // 4. Specific vendor routes require 'vendor' role
    const isVendorProtectedRoute = 
      path.startsWith('/vendor/dashboard') || 
      path.startsWith('/vendor/listings') || 
      path.startsWith('/vendor/enquiries')

    if (isVendorProtectedRoute && role !== 'vendor' && role !== 'admin') {
      url.pathname = '/vendor/register'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
