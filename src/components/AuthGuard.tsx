'use client'

import { useAuth } from '@/app/auth/AuthProvider'
import Image from 'next/image'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { loading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center animate-pulse">
            <Image src="/logo.png" alt="TreeMatch Logo" width={24} height={24} />
          </div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
} 