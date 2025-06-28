import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const searchParams = request.nextUrl.searchParams.toString()
  const fullUrl = `${pathname}${searchParams ? '?' + searchParams : ''}`
  
  console.log('🔥 MIDDLEWARE START:', {
    pathname,
    searchParams,
    fullUrl,
    method: request.method,
    userAgent: request.headers.get('user-agent')?.substring(0, 100)
  })

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
          const cookies = request.cookies.getAll()
          console.log('🍪 MIDDLEWARE COOKIES:', cookies.map(c => `${c.name}=${c.value.substring(0, 20)}...`))
          return cookies
        },
        setAll(cookiesToSet) {
          console.log('🍪 MIDDLEWARE SETTING COOKIES:', cookiesToSet.map(c => `${c.name}=${c.value?.substring(0, 20)}...`))
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  console.log('🔑 MIDDLEWARE: Getting user...')
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  console.log('🔑 MIDDLEWARE USER RESULT:', {
    hasUser: !!user,
    userId: user?.id,
    userEmail: user?.email,
    userError: userError?.message
  })

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isAuthCallback = request.nextUrl.pathname === '/auth/callback'
  const isEditPage = request.nextUrl.pathname === '/edit'
  const isLogoutPage = request.nextUrl.pathname === '/logout'
  const isPublicPage = request.nextUrl.pathname === '/' || request.nextUrl.pathname.startsWith('/meet')

  console.log('🔍 MIDDLEWARE PATH CHECKS:', {
    isAuthPage,
    isAuthCallback,
    isEditPage,
    isLogoutPage,
    isPublicPage,
    pathname
  })

  // Redirect unauthenticated users to login (except for public pages and edit page)
  if (!user && !isAuthPage && !isPublicPage && !isEditPage) {
    console.log('🚫 MIDDLEWARE: Redirecting unauthenticated user to login from:', pathname)
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages (EXCEPT callback)
  if (user && isAuthPage && !isAuthCallback) {
    console.log('🔀 MIDDLEWARE: Redirecting authenticated user away from auth page:', { pathname, userId: user.id })
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // SPECIAL HANDLING FOR AUTH CALLBACK
  if (isAuthCallback) {
    console.log('🔗 MIDDLEWARE: Auth callback detected - allowing through', {
      hasUser: !!user,
      searchParams,
      userId: user?.id
    })
    return supabaseResponse
  }

  // Check if user needs to complete profile (redirect to /edit if not onboarded)
  if (user && !isAuthPage && !isEditPage && !isLogoutPage && !isPublicPage) {
    console.log('👤 MIDDLEWARE: Checking if user needs profile completion...', { userId: user.id })
    try {
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('id, name, "isOnboarded"')
        .eq('id', user.id)
        .single()
      
      console.log('👤 MIDDLEWARE: Student check result:', { 
        student, 
        studentError: studentError?.message,
        isOnboarded: student?.isOnboarded 
      })
      
      if (!student || !student.isOnboarded) {
        console.log('📝 MIDDLEWARE: Redirecting to profile setup from:', pathname)
        const url = request.nextUrl.clone()
        url.pathname = '/edit'
        return NextResponse.redirect(url)
      }
    } catch (error) {
      console.log('❌ MIDDLEWARE: Student check error, redirecting to profile setup:', error)
      // If student record doesn't exist, redirect to profile setup
      const url = request.nextUrl.clone()
      url.pathname = '/edit'
      return NextResponse.redirect(url)
    }
  }

  console.log('✅ MIDDLEWARE: Allowing request through to:', pathname)
  return supabaseResponse

  } catch (error) {
    console.error('💥 MIDDLEWARE ERROR:', error)
    console.log('💥 MIDDLEWARE ERROR - allowing request through due to error')
    return NextResponse.next({
      request,
    })
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 