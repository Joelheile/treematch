import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center space-y-4">
              <Skeleton className="h-12 w-12 rounded-xl mx-auto" />
              <Skeleton className="h-8 w-48 mx-auto" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-96 w-full rounded-lg" />
            </div>
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  )
} 