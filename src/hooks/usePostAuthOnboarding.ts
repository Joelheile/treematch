import { useAuth } from '@/app/auth/AuthProvider'
import { onboardingService } from '@/hooks/onboarding/onboarding-service'
import { OnboardingStorage } from '@/lib/onboarding-storage'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { toast } from 'sonner'

export const usePostAuthOnboarding = () => {
  const { user, loading: authLoading } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasProcessed, setHasProcessed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const executionRef = useRef(false)

  useEffect(() => {
    if (authLoading) {
      return;
    }
    
    if (!user?.email) {
      return;
    }
    
    if (pathname === '/logout' || pathname?.startsWith('/auth/')) {
      executionRef.current = false;
      return;
    }
    
    if (hasProcessed || isProcessing) {
      return;
    }
    
    if (executionRef.current) {
      return;
    }

    executionRef.current = true;
    setIsProcessing(true);

    (async function handlePostAuthFlow() {
      try {
        // First, always check the current database profile
        const { data: student } = await onboardingService.getStudentByEmail(user.email);
        
        // If user has a complete profile in the database, clear any stale localStorage
        if (student && student.isOnboarded && student.name && student.country && student.university && student.phone_number) {
          // Clear any stale localStorage data since DB profile is complete
          if (OnboardingStorage.exists()) {
            OnboardingStorage.clear();
          }
          setHasProcessed(true);
          return;
        }
        
        // If profile is incomplete, check if we have localStorage data to process
        const onboardingData = OnboardingStorage.load();
        if (onboardingData && !OnboardingStorage.isExpired()) {
          const result = await onboardingService.saveOnboardingDataToDatabase(
            onboardingData,
            user.email
          );
          if (result.error) {
            toast.error(`Failed to save your profile: ${result.error}`);
          } else {
            toast.success('Welcome! Your profile has been created successfully. 🎉');
            OnboardingStorage.clear();
            setTimeout(() => {
              router.push('/');
            }, 1500);
          }
          setHasProcessed(true);
        } else {
          // No localStorage data and incomplete profile - user needs to complete onboarding
          setHasProcessed(false);
        }
      } catch (error) {
        // On error, allow user to try onboarding
        setHasProcessed(false);
      } finally {
        setIsProcessing(false);
      }
    })();
  }, [user?.email, authLoading, pathname, router]);

  return {
    isProcessing,
    hasProcessed
  }
} 