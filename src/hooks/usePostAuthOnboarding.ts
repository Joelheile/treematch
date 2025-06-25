import { useAuth } from '@/app/auth/AuthProvider'
import { onboardingService } from '@/hooks/onboarding/onboarding-service'
import { OnboardingStorage } from '@/lib/onboarding-storage'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export const usePostAuthOnboarding = () => {
  const { user, loading: authLoading } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasProcessed, setHasProcessed] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const processOnboardingData = async () => {
      if (authLoading || !user?.email || hasProcessed || isProcessing) {
        return
      }

      const onboardingData = OnboardingStorage.load()
      if (!onboardingData) {
        return
      }

      if (OnboardingStorage.isExpired()) {
        OnboardingStorage.clear()
        return
      }
      setIsProcessing(true)
      
      try {
        const result = await onboardingService.saveOnboardingDataToDatabase(
          onboardingData,
          user.email
        )

        if (result.error) {
          toast.error(`Failed to save your profile: ${result.error}`)
        } else {
          toast.success('Welcome! Your profile has been created successfully. 🎉')
          
          OnboardingStorage.clear()
          
          setTimeout(() => {
            router.push('/')
          }, 1500)
        }
        
        setHasProcessed(true)
      } catch (error) {
        toast.error('An unexpected error occurred while setting up your profile.')
      } finally {
        setIsProcessing(false)
      }
    }

    const timer = setTimeout(processOnboardingData, 100)
    return () => clearTimeout(timer)
  }, [user, authLoading, hasProcessed, isProcessing, router])

  return {
    isProcessing,
    hasProcessed
  }
} 