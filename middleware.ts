import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isAuthCallback = request.nextUrl.pathname === '/auth/callback'
  const isEditPage = request.nextUrl.pathname === '/edit'
  const isLogoutPage = request.nextUrl.pathname === '/logout'
  const isPublicPage = request.nextUrl.pathname === '/' || request.nextUrl.pathname.startsWith('/meet')

  try {

  const supabaseResponse = NextResponse.next({
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
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect unauthenticated users to login (except for public pages and edit page)
  if (!user && !isAuthPage && !isPublicPage && !isEditPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages (EXCEPT callback)
  if (user && isAuthPage && !isAuthCallback) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // SPECIAL HANDLING FOR AUTH CALLBACK
  if (isAuthCallback) {
    return supabaseResponse
  }

  // Check if user needs to complete profile (redirect to /edit if not onboarded)
  if (user && !isAuthPage && !isEditPage && !isLogoutPage && !isPublicPage) {
    const { data: student } = await supabase
      .from('students')
      .select('"isOnboarded"')
      .eq('id', user.id)
      .maybeSingle()

    if (!student?.isOnboarded) {
      const url = request.nextUrl.clone()
      url.pathname = '/edit'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse

  } catch (error) {
    console.error('Auth middleware failed:', error)
    if (isAuthPage || isPublicPage || isEditPage) {
      return NextResponse.next({ request })
    }
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 