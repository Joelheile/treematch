import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Temporarily disable middleware to test
  return NextResponse.next()
  
  // let supabaseResponse = NextResponse.next({
  //   request,
  // })

  // const supabase = createServerClient(
  //   process.env.NEXT_PUBLIC_SUPABASE_URL! || 'https://zlggajmzyjrwojzhidlo.supabase.co',
  //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsZ2dham16eWpyd29qemhpZGxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NDU5MTYsImV4cCI6MjA2NjIyMTkxNn0.HSRXxseFiCnX5VpM51NjJ18sMJ3XNNKCnq_8hV1e_dc',
  //   {
  //     cookies: {
  //       getAll() {
  //         return request.cookies.getAll()
  //       },
  //       setAll(cookiesToSet) {
  //         cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
  //         supabaseResponse = NextResponse.next({
  //           request,
  //         })
  //         cookiesToSet.forEach(({ name, value, options }) =>
  //           supabaseResponse.cookies.set(name, value, options)
  //         )
  //       },
  //     },
  //   }
  // )

  // const {
  //   data: { user },
  // } = await supabase.auth.getUser()

  // if (!user && !request.nextUrl.pathname.startsWith('/auth')) {
  //   const url = request.nextUrl.clone()
  //   url.pathname = '/auth/login'
  //   return NextResponse.redirect(url)
  // }

  // if (user && request.nextUrl.pathname.startsWith('/auth')) {
  //   const url = request.nextUrl.clone()
  //   url.pathname = '/'
  //   return NextResponse.redirect(url)
  // }

  // return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 