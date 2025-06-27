"use client";

import { useAuth } from "@/app/auth/AuthProvider";
import { LandingPage } from "@/components/LandingPage";
import { StudentOverview } from "@/components/StudentOverview";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/UserMenu";
import { useCurrentStudent } from "@/hooks/useCurrentStudent";
import { usePostAuthOnboarding } from "@/hooks/usePostAuthOnboarding";
import { OnboardingStorage } from "@/lib/onboarding-storage";
import { TreePine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { student, isOnboarded, isLoading: studentLoading, error } = useCurrentStudent();
  const { isProcessing: onboardingProcessing, hasProcessed: onboardingProcessed } = usePostAuthOnboarding();
  const [hasOnboardingData, setHasOnboardingData] = useState(false);

  useEffect(() => {
    setHasOnboardingData(
      OnboardingStorage.exists() && !OnboardingStorage.isExpired()
    );
  }, []);

  // Show landing page for unauthenticated users
  if (!authLoading && !user) {
    return <LandingPage />;
  }

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center animate-pulse">
            <TreePine className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm text-gray-500">
            {hasOnboardingData ? "Setting up your profile..." : "Loading..."}
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="ghost"
            size="sm"
            className="mt-4 text-xs"
          >
            Taking too long? Click to refresh
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state while student data is loading or onboarding is processing
  if (studentLoading || onboardingProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center animate-pulse">
            <TreePine className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm text-gray-500">
            {onboardingProcessing ? "Setting up your profile..." : "Loading your profile..."}
          </p>
        </div>
      </div>
    );
  }

  // Show onboarding prompt if user is not onboarded and post-auth processing is complete
  if (error || (!isOnboarded && onboardingProcessed)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-600 rounded-xl flex items-center justify-center">
            <TreePine className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Welcome to Treematch!</h1>
            <p className="text-gray-600">
              Let's set up your profile to get started.
            </p>
          </div>
          <Button
            onClick={() => router.push("/edit")}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3"
          >
            Complete Your Profile
          </Button>
        </div>
      </div>
    );
  }

  // Show main app if user is authenticated and onboarded
  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10">
        <UserMenu />
      </div>
      <StudentOverview />
    </div>
  );
}
