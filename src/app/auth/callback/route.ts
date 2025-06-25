import { createClient } from '@/integrations/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (!code) {
      return NextResponse.redirect(`${origin}/auth/login?error=Missing authentication code`)
    }

    if (next && !next.startsWith('/')) {
      return NextResponse.redirect(`${origin}/auth/login?error=Invalid redirect URL`)
    }

    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${origin}/auth/login?error=Authentication failed`)
    }

    return NextResponse.redirect(`${origin}${next}`)
  } catch (error) {
    console.error('Auth callback unexpected error:', error)
    return NextResponse.redirect(`${origin}/auth/login?error=Unexpected error occurred`)
  }
} 