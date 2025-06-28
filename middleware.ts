import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isEditPage = request.nextUrl.pathname === '/edit'
  const isLogoutPage = request.nextUrl.pathname === '/logout'
  const isPublicPage = request.nextUrl.pathname === '/' || request.nextUrl.pathname.startsWith('/meet')

  // Redirect unauthenticated users to login (except for public pages and edit page)
  if (!user && !isAuthPage && !isPublicPage && !isEditPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Check if user needs to complete profile (redirect to /edit if not onboarded)
  if (user && !isAuthPage && !isEditPage && !isLogoutPage && !isPublicPage) {
    try {
      const { data: student } = await supabase
        .from('students')
        .select('id, name, "isOnboarded"')
        .eq('id', user.id)
        .single()
      
      if (!student || !student.isOnboarded) {
        const url = request.nextUrl.clone()
        url.pathname = '/edit'
        return NextResponse.redirect(url)
      }
    } catch (error) {
      // If student record doesn't exist, redirect to profile setup
      const url = request.nextUrl.clone()
      url.pathname = '/edit'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 