import { createClient } from '@/integrations/supabase/server'
import { NextResponse } from 'next/server'

// Force this route to be dynamic
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    // Get origin from headers or construct from host
    const host = request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const origin = `${protocol}://${host}`

    if (!code) {
      return NextResponse.redirect(`${origin}/auth/login?error=Missing authentication code`)
    }

    if (next && !next.startsWith('/')) {
      return NextResponse.redirect(`${origin}/auth/login?error=Invalid redirect URL`)
    }

    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      return NextResponse.redirect(`${origin}/auth/login?error=Authentication failed`)
    }

    return NextResponse.redirect(`${origin}${next}`)
  } catch (error) {
    return NextResponse.redirect(`${origin || 'http://localhost:3000'}/auth/login?error=Unexpected error occurred`)
  }
} 