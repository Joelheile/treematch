import { createClient } from '@/integrations/supabase/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const EMAIL_OTP_TYPES: EmailOtpType[] = ['signup', 'invite', 'magiclink', 'recovery', 'email_change', 'email']

const isEmailOtpType = (value: string): value is EmailOtpType =>
  (EMAIL_OTP_TYPES as string[]).includes(value)

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  const supabase = createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return redirectAfterAuth(supabase, origin)
    console.error('OAuth flow error:', error)
  }

  if (tokenHash && type && isEmailOtpType(type)) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    if (!error) return redirectAfterAuth(supabase, origin)
    console.error('Email verification error:', error)
    return NextResponse.redirect(`${origin}/auth/auth-error?error=verification_failed`)
  }

  return NextResponse.redirect(`${origin}/auth/auth-error?error=missing_params`)
}

async function redirectAfterAuth(supabase: ReturnType<typeof createClient>, origin: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${origin}/`)

  const { data: student } = await supabase
    .from('students')
    .select('isOnboarded')
    .eq('id', user.id)
    .single()

  return NextResponse.redirect(student?.isOnboarded ? `${origin}/` : `${origin}/edit`)
}
