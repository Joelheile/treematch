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

      console.log('Verify OTP attempt:', { type, token_hash: token_hash.substring(0, 8) + '...' });
      
      const { data, error } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      })
      
      console.log('Verify OTP result:', { 
        success: !error, 
        hasSession: !!data.session,
        hasUser: !!data.user,
        error: error?.message 
      });
      
      if (!error && data.session) {
        // Use the verified user from the OTP response
        const user = data.user
        console.log('Verified user:', { id: user?.id, email: user?.email });
        
        if (user) {
          // Check if user has a student profile by email first (handles ID mismatches)
          const { data: student } = await supabase
            .from('students')
            .select('id, name, email')
            .eq('email', user.email)
            .single()
          
          if (!student) {
            // No student profile exists for this email, create a minimal record
            try {
              console.log('Creating new student record for:', user.email)
              const { error: insertError } = await supabase
                .from('students')
                .insert({
                  id: user.id,
                  email: user.email,
                  name: '', // Will be updated from localStorage by PostAuthOnboardingProcessor
                  isOnboarded: false
                })
              
              if (insertError) {
                console.error('Failed to insert student record:', insertError)
              } else {
                console.log('Student record created successfully')
              }
            } catch (error) {
              console.error('Exception creating student record:', error)
            }
            
            // Redirect to home - PostAuthOnboardingProcessor will process localStorage data
            return NextResponse.redirect(new URL('/', request.url))
          } else if (student.id !== user.id) {
            // Student exists with same email but different user ID
            // Let PostAuthOnboarding handle this case by redirecting to home
            console.log('Student exists with different ID. Email:', user.email, 'Existing ID:', student.id, 'New ID:', user.id)
            console.log('Redirecting to home - PostAuthOnboarding will handle data reconciliation')
            return NextResponse.redirect(new URL('/', request.url))
          } else {
            // Student exists with correct email and ID
            console.log('Student exists with correct ID:', user.id)
            
            // If student exists but name is empty, still need onboarding
            if (!student.name) {
              return NextResponse.redirect(new URL('/edit', request.url))
            }
          }
        }
        
        // Redirect to app after successful verification
        return NextResponse.redirect(new URL(next, request.url))
      } else {
        // Record failed verification attempt
        recordFailedVerification(token_hash)
        
        // Handle specific OTP errors
        console.error('OTP verification failed:', error)
        console.error('Full error details:', JSON.stringify(error, null, 2))
        console.error('Server time:', new Date().toISOString())
        console.error('Token hash (first 8 chars):', token_hash.substring(0, 8))
        
        if (error.message?.includes('otp_expired') || error.message?.includes('expired')) {
          // Don't retry expired OTPs, redirect with specific error
          console.warn(`Expired OTP verification attempt for token: ${token_hash.substring(0, 8)}...`)
          return NextResponse.redirect(new URL('/auth/auth-code-error?error=expired', request.url))
        }
        
        if (error.message?.includes('invalid') || error.message?.includes('not_found')) {
          // Invalid or already used OTP
          console.warn(`Invalid/used OTP verification attempt for token: ${token_hash.substring(0, 8)}...`)
          return NextResponse.redirect(new URL('/auth/auth-code-error?error=invalid', request.url))
        }
        
        // Log other errors but don't expose details to user
        console.error('Unexpected OTP verification error:', error)
        return NextResponse.redirect(new URL('/auth/auth-code-error?error=unknown', request.url))
      }
    } catch (exception) {
      // Catch any unexpected errors/exceptions during verification
      console.error('Exception during OTP verification:', exception)
      recordFailedVerification(token_hash)
      return NextResponse.redirect(new URL('/auth/auth-code-error?error=exception', request.url))
    }
  }

  // Redirect to error page if verification fails
  return NextResponse.redirect(new URL('/auth/auth-code-error', request.url))
}