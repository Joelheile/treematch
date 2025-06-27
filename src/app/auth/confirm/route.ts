import { createClient } from '@/integrations/supabase/server';
import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';

// Simple in-memory cache to track failed verification attempts
// In production, consider using Redis or a proper cache solution
const failedVerifications = new Map<string, { count: number; lastAttempt: number }>()

// Rate limiting: max 3 attempts per token hash within 5 minutes
const MAX_ATTEMPTS = 3
const RATE_LIMIT_WINDOW = 5 * 60 * 1000 // 5 minutes

function isRateLimited(tokenHash: string): boolean {
  const now = Date.now()
  const record = failedVerifications.get(tokenHash)
  
  if (!record) return false
   
  // Reset if outside   rate limit  window
  if (now - record.lastAttempt > RATE_LIMIT_WINDOW) {
    failedVerifications.delete(tokenHash)
    return false
  }
  
  return record.count >= MAX_ATTEMPTS
}

function recordFailedVerification(tokenHash: string): void {
  const now = Date.now()
  const record = failedVerifications.get(tokenHash)
  
  if (!record || now - record.lastAttempt > RATE_LIMIT_WINDOW) {
    failedVerifications.set(tokenHash, { count: 1, lastAttempt: now })
  } else {
    failedVerifications.set(tokenHash, { 
      count: record.count + 1, 
      lastAttempt: now 
    })
  }
  
  // Cleanup old entries periodically
  if (failedVerifications.size > 1000) {
    const entries = Array.from(failedVerifications.entries())
    for (const [key, value] of entries) {
      if (now - value.lastAttempt > RATE_LIMIT_WINDOW) {
        failedVerifications.delete(key)
      }
    }
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    // Check rate limiting first
    if (isRateLimited(token_hash)) {
      console.warn(`Rate limited OTP verification attempt for token: ${token_hash.substring(0, 8)}...`)
      return NextResponse.redirect(new URL('/auth/auth-code-error?error=rate_limited', request.url))
    }

    try {
      const supabase = createClient()
      
      const { data, error } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      })
      
      if (!error && data.session && data.user) {
        console.log('✅ OTP verification successful for user:', data.user.email)
        
        // Create fresh client with the new session for database operations
        const authenticatedSupabase = createClient()
        
        // Set the session explicitly to ensure auth context
        await authenticatedSupabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        })
        
        const user = data.user
        
        try {
          // Check if student profile exists by email first
          const { data: existingStudent, error: fetchError } = await authenticatedSupabase
            .from('students')
            .select('id, name, email, "isOnboarded"')
            .eq('email', user.email)
            .maybeSingle()
          
          if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error checking existing student:', fetchError)
          }
          
          if (!existingStudent) {
            // Create new student record with authenticated context
            console.log('🆕 Creating new student record for:', user.email)
            const { data: newStudent, error: insertError } = await authenticatedSupabase
              .from('students')
              .insert({
                id: user.id,
                email: user.email,
                name: '',
                isOnboarded: false
              })
              .select()
              .single()
            
            if (insertError) {
              console.error('❌ Failed to create student record:', insertError)
              // Don't fail the auth flow, just log the error
            } else {
              console.log('✅ Successfully created student record:', newStudent.id)
            }
          } else if (existingStudent.id !== user.id) {
            // Student exists with same email but different user ID - update the ID
            console.log('🔄 Updating student ID for existing email:', user.email)
            const { error: updateError } = await authenticatedSupabase
              .from('students')
              .update({ id: user.id })
              .eq('email', user.email)
            
            if (updateError) {
              console.error('❌ Failed to update student ID:', updateError)
            } else {
              console.log('✅ Successfully updated student ID')
            }
          } else {
            console.log('✅ Student record already exists:', existingStudent.id)
          }
        } catch (dbError) {
          console.error('💥 Database operation failed:', dbError)
          // Don't fail the auth flow for database errors
        }
        
        // Always redirect to home - PostAuthOnboarding will handle the rest
        return NextResponse.redirect(new URL('/', request.url))
      } else {
        // Record failed verification attempt
        recordFailedVerification(token_hash)
        
        // Handle specific OTP errors
        console.error('❌ OTP verification failed:', error)
        console.error('Server time:', new Date().toISOString())
        console.error('Token hash (first 8 chars):', token_hash.substring(0, 8))
        
        if (error.message?.includes('otp_expired') || error.message?.includes('expired')) {
          // Don't retry expired OTPs, redirect with specific error
          console.warn(`⏰ Expired OTP for token: ${token_hash.substring(0, 8)}...`)
          return NextResponse.redirect(new URL('/auth/auth-code-error?error=expired', request.url))
        }
        
        if (error.message?.includes('invalid') || error.message?.includes('not_found')) {
          // Invalid or already used OTP
          console.warn(`❌ Invalid/used OTP for token: ${token_hash.substring(0, 8)}...`)
          return NextResponse.redirect(new URL('/auth/auth-code-error?error=invalid', request.url))
        }
        
        // Log other errors but don't expose details to user
        console.error('💥 Unexpected OTP verification error:', error)
        return NextResponse.redirect(new URL('/auth/auth-code-error?error=unknown', request.url))
      }
    } catch (exception) {
      // Catch any unexpected errors/exceptions during verification
      console.error('💥 Exception during OTP verification:', exception)
      recordFailedVerification(token_hash)
      return NextResponse.redirect(new URL('/auth/auth-code-error?error=exception', request.url))
    }
  }

  // Redirect to error page if verification fails
  return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
}