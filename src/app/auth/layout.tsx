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
            <div className="mx-auto w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center animate-pulse">
              <Image src="/logo.png" alt="TreeMatch Logo" width={24} height={24} />
            </div>
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  )
} 