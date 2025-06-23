'use client'

import { useAuth } from '@/app/auth/AuthProvider'
import { Skeleton } from '@/components/ui/skeleton'
import { TreePine } from 'lucide-react'

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { loading, user } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-primary rounded-xl flex items-center justify-center animate-pulse">
            <TreePine className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-32 mx-auto" />
            <Skeleton className="h-3 w-24 mx-auto" />
          </div>
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