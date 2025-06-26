import { useAuth } from '@/app/auth/AuthProvider'
import { onboardingService } from '@/hooks/onboarding/onboarding-service'
import { OnboardingStorage } from '@/lib/onboarding-storage'
import { useCurrentStudent } from '@/hooks/useCurrentStudent'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export const usePostAuthOnboarding = () => {
  const { user, loading: authLoading } = useAuth()
  const { student, isLoading: studentLoading } = useCurrentStudent()
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasProcessed, setHasProcessed] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const processOnboardingData = async () => {
      if (authLoading || studentLoading || !user?.email || hasProcessed || isProcessing) {
        return
      }

      // If user is already onboarded, don't process or show toast
      if (student && student.isOnboarded) {
        // Clear any old onboarding data
        if (OnboardingStorage.exists()) {
          OnboardingStorage.clear()
        }
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
          // Only show success toast for users who actually went through onboarding
          toast.success('Welcome to TreeMatch! Your profile is ready. 🎉')
          
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
  }, [user, authLoading, studentLoading, student, hasProcessed, isProcessing, router])

  return {
    isProcessing,
    hasProcessed
  }
} 