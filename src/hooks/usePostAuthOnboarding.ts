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
      // Don't process if:
      // - Still loading auth
      // - No user
      // - Already processed this session
      // - Currently processing
      if (authLoading || !user?.email || hasProcessed || isProcessing) {
        return
      }

      // Check if there's onboarding data in localStorage
      const onboardingData = OnboardingStorage.load()
      if (!onboardingData) {
        return
      }

      // Check if data is expired (older than 24 hours)
      if (OnboardingStorage.isExpired()) {
        console.log('Onboarding data expired, clearing localStorage')
        OnboardingStorage.clear()
        return
      }

      console.log('Processing onboarding data for user:', user.email)
      setIsProcessing(true)
      
      try {
        const result = await onboardingService.saveOnboardingDataToDatabase(
          onboardingData,
          user.email
        )

        if (result.error) {
          toast.error(`Failed to save your profile: ${result.error}`)
          console.error('Error saving onboarding data:', result.error)
        } else {
          toast.success('Welcome! Your profile has been created successfully. 🎉')
          console.log('Onboarding data saved successfully')
          
          // Clear the localStorage data since it's now in the database
          OnboardingStorage.clear()
          
          // Redirect to main app after a short delay to let the toast show
          setTimeout(() => {
            router.push('/')
          }, 1500)
        }
        
        setHasProcessed(true)
      } catch (error) {
        console.error('Unexpected error processing onboarding data:', error)
        toast.error('An unexpected error occurred while setting up your profile.')
      } finally {
        setIsProcessing(false)
      }
    }

    // Add a small delay to ensure auth state is fully settled
    const timer = setTimeout(processOnboardingData, 100)
    return () => clearTimeout(timer)
  }, [user, authLoading, hasProcessed, isProcessing, router])

  return {
    isProcessing,
    hasProcessed
  }
} 