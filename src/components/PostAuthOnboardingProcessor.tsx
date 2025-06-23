"use client";

import { usePostAuthOnboarding } from "@/hooks/usePostAuthOnboarding";

export function PostAuthOnboardingProcessor() {
  usePostAuthOnboarding();

  // This component doesn't render anything visible
  // It just runs the hook to process onboarding data
  return null;
}
