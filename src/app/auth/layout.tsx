import { Suspense } from 'react'
import Image from 'next/image'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
          <div className="text-center space-y-4">
            <Image src="/logo.png" alt="TreeMatch Logo" width={48} height={48} className="mx-auto animate-pulse" />
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  )
} 