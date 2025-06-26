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
    console.log('[PostAuthOnboarding] Effect triggered', { 
      authLoading, 
      user: !!user, 
      hasProcessed, 
      isProcessing, 
      pathname,
      executionRef: executionRef.current
    });

    // Early returns for various conditions
    if (authLoading) {
      console.log('[PostAuthOnboarding] Auth still loading, skipping');
      return;
    }
    
    if (!user?.email) {
      console.log('[PostAuthOnboarding] No user email, skipping');
      return;
    }
    
    // Don't redirect if user is on logout page or auth pages
    if (pathname === '/logout' || pathname?.startsWith('/auth/')) {
      console.log('[PostAuthOnboarding] Skipping redirect - user on logout/auth page', pathname);
      // Reset execution ref when on logout/auth pages
      executionRef.current = false;
      return;
    }
    
    if (hasProcessed || isProcessing) {
      console.log('[PostAuthOnboarding] Already processed or processing, skipping');
      return;
    }
    
    // Prevent multiple executions
    if (executionRef.current) {
      console.log('[PostAuthOnboarding] Already executed this session, skipping');
      return;
    }

    console.log('[PostAuthOnboarding] Starting onboarding check');
    executionRef.current = true;
    
    const onboardingData = OnboardingStorage.load();
    if (onboardingData && !OnboardingStorage.isExpired()) {
      console.log('[PostAuthOnboarding] Found onboarding data, processing...');
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
    console.log('[PostAuthOnboarding] No onboarding data, checking DB profile...');
    setIsProcessing(true);
    (async function checkDbProfile() {
      try {
        const { data: student } = await onboardingService.getStudentByEmail(user.email);
        if (!student || !student.isOnboarded || !student.name || !student.country || !student.university || !student.phone_number) {
          console.log('[PostAuthOnboarding] Incomplete profile detected');
          setHasProcessed(false);
        } else {
          console.log('[PostAuthOnboarding] Complete profile detected, redirecting to home');
          setHasProcessed(true);
          router.push('/');
        }
      } catch (error) {
        console.log('[PostAuthOnboarding] Error checking profile, allowing user to try onboarding');
        setHasProcessed(false);
      } finally {
        setIsProcessing(false);
      }
    })();
  }, [user?.email, authLoading, pathname]);

  return {
    isProcessing,
    hasProcessed
  }
} 