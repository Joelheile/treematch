'use client'

import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Mail } from 'lucide-react'
import { useState } from 'react'

export default function MagicLinkPage() {
  const searchParams = useSearchParams()
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const [isVerifying, setIsVerifying] = useState(false)

  const handleConfirmSignIn = () => {
    if (tokenHash && type) {
      setIsVerifying(true)
      // Redirect to our confirmation route
      const confirmationUrl = `/auth/confirm?token_hash=${tokenHash}&type=${type}`
      console.log('Redirecting to:', confirmationUrl)
      window.location.href = confirmationUrl
    }
  }

  if (!tokenHash || !type) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Invalid Link</CardTitle>
            <CardDescription>
              This magic link appears to be invalid or malformed.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => window.location.href = '/auth/login'}
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Magic Link Received</CardTitle>
          <CardDescription>
            Click the button below to complete your sign-in to TreeMatch
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-slate-600">
            This extra step helps protect your account from automated email scanners.
          </div>
          
          <Button 
            onClick={handleConfirmSignIn}
            disabled={isVerifying}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Complete Sign-In'
            )}
          </Button>
          
          <div className="text-center">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.href = '/auth/login'}
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 