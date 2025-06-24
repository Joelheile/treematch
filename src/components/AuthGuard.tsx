'use client'

import { useAuth } from '@/app/auth/AuthProvider'
import { TreePine } from 'lucide-react'

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { loading, user } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center animate-pulse">
            <TreePine className="w-6 h-6 text-primary-foreground" />
          </div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login'
    }
    return null
  }

  return <>{children}</>
} 