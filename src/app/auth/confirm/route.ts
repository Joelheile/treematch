import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/integrations/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const supabase = createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    
    if (!error) {
      // Check if this is a new user and redirect to /edit if they don't have a profile
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if user has a student profile
        const { data: student } = await supabase
          .from('students')
          .select('id, name')
          .eq('id', user.id)
          .single()
        
        // If no student profile exists or name is empty, redirect to /edit
        if (!student || !student.name) {
          return NextResponse.redirect(new URL('/edit', request.url))
        }
      }
      
      // Redirect to app after successful verification
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Redirect to error page if verification fails
  return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
}