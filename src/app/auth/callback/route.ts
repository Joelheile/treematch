import { createClient } from '@/integrations/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
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
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-error`)
} 