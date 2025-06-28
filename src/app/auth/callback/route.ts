import { createClient } from '@/integrations/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/'

  console.log('Callback params:', { code, token_hash, type, origin })

  const supabase = createClient()

  // Handle OAuth flow (code parameter)
  if (code) {
    console.log('Handling OAuth flow with code:', code)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      console.log('OAuth flow successful')
      return await handleSuccessfulAuth(supabase, origin)
    } else {
      console.error('OAuth flow error:', error)
    }
  }

  // Handle email verification flow (token_hash and type parameters)
  if (token_hash && type) {
    console.log('Handling email verification with:', { token_hash, type })
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    })
    
    console.log('VerifyOtp result:', { data, error })
    
    if (!error) {
      console.log('Email verification successful')
      return await handleSuccessfulAuth(supabase, origin)
    } else {
      console.error('Email verification error:', error)
      // Include error in redirect for debugging
      return NextResponse.redirect(`${origin}/auth/auth-error?error=verification_failed&details=${encodeURIComponent(error.message)}`)
    }
  }

  console.log('No valid params found, redirecting to error')
  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-error?error=missing_params`)
}

async function handleSuccessfulAuth(supabase: any, origin: string) {
  // Check if user has completed onboarding
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    const { data: student } = await supabase
      .from('students')
      .select('isOnboarded')
      .eq('id', user.id)
      .single()
    
    if (student?.isOnboarded) {
      // User is verified and onboarded, redirect to main app
      return NextResponse.redirect(`${origin}/`)
    } else {
      // User is verified but not onboarded, redirect to complete profile
      return NextResponse.redirect(`${origin}/edit`)
    }
  }
  
  // Fallback: redirect to main app
  return NextResponse.redirect(`${origin}/`)
} 