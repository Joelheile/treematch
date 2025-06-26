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
    if (authLoading) return;
    if (!user?.email || hasProcessed || isProcessing) return;
    const onboardingData = OnboardingStorage.load();
    if (onboardingData && !OnboardingStorage.isExpired()) {
      setIsProcessing(true);
      (async function processOnboarding() {
        try {
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
        } catch (error) {
          toast.error('An unexpected error occurred while setting up your profile.');
        } finally {
          setIsProcessing(false);
        }
      })();
      return;
    }
    // If no onboarding data, check DB profile
    (async function checkDbProfile() {
      setIsProcessing(true);
      try {
        const { data: student } = await onboardingService.getStudentByEmail(user.email);
        if (!student || !student.isOnboarded || !student.name || !student.country || !student.university || !student.phone_number) {
          // Incomplete profile: show onboarding UI (handled by OnboardingLogic)
          setHasProcessed(false);
        } else {
          // Complete profile: redirect to main app
          router.push('/');
        }
      } catch (error) {
        // If error, let user try onboarding again
        setHasProcessed(false);
      } finally {
        setIsProcessing(false);
      }
    })();
  }, [user, authLoading, hasProcessed, isProcessing, router]);

  return {
    isProcessing,
    hasProcessed
  }
} 