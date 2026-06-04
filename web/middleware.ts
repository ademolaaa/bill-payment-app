import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
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

  const currentPath = request.nextUrl.pathname

  // Protected routes list
  const protectedRoutes = [
    '/home',
    '/investments',
    '/pay-bills',
    '/profile',
    '/settings',
    '/referral',
    '/withdraw',
    '/deposit'
  ]

  const isProtectedRoute = protectedRoutes.some(route => currentPath.startsWith(route))

  if (isProtectedRoute) {
    if (!user) {
      // No active user, redirect to login
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Check MFA status: if enrolled (nextLevel is aal2) but current session is only aal1, redirect to login for challenge
    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (aalData && aalData.nextLevel === 'aal2' && aalData.currentLevel === 'aal1') {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('mfa', '1')
      return NextResponse.redirect(url)
    }
  }

  // If a user is already logged in and tries to access login or signup, send them to home (unless they need MFA verification)
  const hasForceOverride = request.nextUrl.searchParams.get('force') === '1';
  if ((currentPath === '/login' || (currentPath === '/signup' && !hasForceOverride)) && user) {
    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    const needsMfa = aalData && aalData.nextLevel === 'aal2' && aalData.currentLevel === 'aal1'
    
    if (!needsMfa) {
      const url = request.nextUrl.clone()
      url.pathname = '/home'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
