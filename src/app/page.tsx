"use client";

import { useAuth } from "@/app/auth/AuthProvider";
import { LandingPage } from "@/components/LandingPage";
import { StudentOverview } from "@/components/StudentOverview";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserMenu } from "@/components/UserMenu";
import { useCurrentStudent } from "@/hooks/useCurrentStudent";
import { OnboardingStorage } from "@/lib/onboarding-storage";
import { TreePine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { isOnboarded, isLoading: studentLoading, error } = useCurrentStudent();
  const [hasOnboardingData, setHasOnboardingData] = useState(false);
  const [delayPassed, setDelayPassed] = useState(false);

  // Check for onboarding data
  useEffect(() => {
    setHasOnboardingData(
      OnboardingStorage.exists() && !OnboardingStorage.isExpired()
    );
  }, []);

  // Add a small delay to allow post-auth processing
  useEffect(() => {
    const timer = setTimeout(() => setDelayPassed(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // If user is not authenticated and we've given enough time for auth processing, show landing page
  if (!authLoading && !user && delayPassed) {
    return <LandingPage />;
  }

  // Show loading state while auth is loading or during the initial delay
  if (authLoading || !delayPassed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-red-600 rounded-xl flex items-center justify-center animate-pulse">
            <TreePine className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-32 mx-auto" />
            <Skeleton className="h-3 w-24 mx-auto" />
          </div>
          <p className="text-sm text-gray-500">
            {hasOnboardingData
              ? "Setting up your profile..."
              : "Loading your profile..."}
          </p>
        </div>
      </div>
    );
  }

  // Show loading while student data is loading
  if (studentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-red-600 rounded-xl flex items-center justify-center animate-pulse">
            <TreePine className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-32 mx-auto" />
            <Skeleton className="h-3 w-24 mx-auto" />
          </div>
          <p className="text-sm text-gray-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // If there's an error or user is not onboarded, prompt for onboarding
  if (error || !isOnboarded) {
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
            onClick={() => router.push("/onboarding")}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3"
          >
            Complete Your Profile
          </Button>
        </div>
      </div>
    );
  }

  // User is authenticated and onboarded, show the main app
  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10">
        <UserMenu />
      </div>
      <StudentOverview />
    </div>
  );
}
