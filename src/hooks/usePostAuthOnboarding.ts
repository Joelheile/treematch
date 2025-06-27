import { useAuth } from '@/app/auth/AuthProvider'
import { onboardingService } from '@/hooks/onboarding/onboarding-service'
import { OnboardingStorage } from '@/lib/onboarding-storage'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

export const usePostAuthOnboarding = () => {
  const { user, loading: authLoading, session } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasProcessed, setHasProcessed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const executionRef = useRef(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    // Reset execution ref when user changes
    if (!user) {
      executionRef.current = false
      setHasProcessed(false)
      setIsProcessing(false)
      return
    }
  }, [user?.id])

  useEffect(() => {
    // Don't run if auth is still loading
    if (authLoading) {
      return
    }
    
    // Don't run if no user or session
    if (!user?.email || !session) {
      return
    }
    
    // Don't run on auth pages or logout
    if (pathname === '/logout' || pathname?.startsWith('/auth/')) {
      return
    }
    
    // Don't run if already processed or processing
    if (hasProcessed || isProcessing) {
      return
    }
    
    // Prevent duplicate execution
    if (executionRef.current) {
      return
    }

    // Reduced delay to 200ms since auth is now more stable
    const timeoutId = setTimeout(() => {
      if (executionRef.current) return
      
      executionRef.current = true
      setIsProcessing(true)

      handlePostAuthFlow()
    }, 200) // Reduced from 500ms

    return () => clearTimeout(timeoutId)
  }, [user?.email, authLoading, session, pathname, hasProcessed, isProcessing])

  const handlePostAuthFlow = async () => {
    try {
      console.log('🔄 PostAuthOnboarding: Starting processing for', user?.email)
      
      // Simplified: try to get student data with shorter retry
      let student = null
      let retryCount = 0
      const maxRetries = 2 // Reduced from 3
      
      while (retryCount < maxRetries && !student) {
        try {
          const result = await onboardingService.getStudentByEmail(user!.email!)
          student = result.data
          if (!student && retryCount < maxRetries - 1) {
            console.log(`🔄 Student not found, retrying... (${retryCount + 1}/${maxRetries})`)
            await new Promise(resolve => setTimeout(resolve, 500 * (retryCount + 1))) // Shorter delays
          }
        } catch (error) {
          console.error(`💥 Error fetching student (attempt ${retryCount + 1}):`, error)
          if (retryCount < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, 500 * (retryCount + 1)))
          }
        }
        retryCount++
      }
      
      // If user has a complete profile, clear localStorage
      if (student && student.isOnboarded && student.name && student.country && student.university && student.phone_number) {
        console.log('✅ User has complete profile, clearing localStorage')
        if (OnboardingStorage.exists()) {
          OnboardingStorage.clear()
        }
        setHasProcessed(true)
        return
      }
      
      // Check for localStorage data to process
      const onboardingData = OnboardingStorage.load()
      const hasLocalData = !!onboardingData && !OnboardingStorage.isExpired()
      
      console.log('📦 LocalStorage check:', { hasLocalData, dataKeys: onboardingData ? Object.keys(onboardingData) : [] })
      
      if (hasLocalData) {
        console.log('🚀 Processing onboarding data from localStorage')
        const result = await onboardingService.saveOnboardingDataToDatabase(
          onboardingData,
          user!.email!
        )
        
        if (result.error) {
          console.error('❌ Failed to save profile:', result.error)
          toast.error(`Failed to save your profile: ${result.error}`)
        } else {
          console.log('✅ Successfully saved profile to database')
          toast.success('Welcome! Your profile has been created successfully. 🎉')
          OnboardingStorage.clear()
          
          // Simplified cache invalidation
          await queryClient.invalidateQueries({ queryKey: ['student-by-user-id'] })
          await queryClient.refetchQueries({ queryKey: ['student-by-user-id', user!.id] })
        }
        setHasProcessed(true)
      } else {
        console.log('📝 No localStorage data found - user needs to complete onboarding')
        setHasProcessed(true)
      }
    } catch (error) {
      console.error('💥 PostAuthOnboarding: Error processing:', error)
      setHasProcessed(true)
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    isProcessing,
    hasProcessed
  }
} 