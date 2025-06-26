"use client";

import { useAuth } from "@/app/auth/AuthProvider";
import { LandingPage } from "@/components/LandingPage";
import { StudentOverview } from "@/components/StudentOverview";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/UserMenu";
import { useCurrentStudent } from "@/hooks/useCurrentStudent";
import { OnboardingStorage } from "@/lib/onboarding-storage";
import { TreePine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { student, isOnboarded, isLoading: studentLoading, error } = useCurrentStudent();
  const [hasOnboardingData, setHasOnboardingData] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('HomePage Debug:', {
      user: !!user,
      userId: user?.id,
      authLoading,
      studentLoading,
      student: !!student,
      isOnboarded,
      error: error?.toString()
    });

    // Check localStorage for onboarding data
    if (typeof window !== 'undefined') {
      const localStorageKeys = Object.keys(localStorage);
      const onboardingKeys = localStorageKeys.filter(key => 
        key.includes('onboarding') || key.includes('Onboarding') || key.includes('TreeMatch')
      );
      
      console.log('🗂️ LocalStorage Debug:', {
        totalKeys: localStorageKeys.length,
        onboardingKeys,
        allKeys: localStorageKeys.slice(0, 10) // Show first 10 keys
      });

      // Check specific onboarding data
      onboardingKeys.forEach(key => {
        try {
          const data = localStorage.getItem(key);
          console.log(`📦 LocalStorage [${key}]:`, data ? JSON.parse(data) : null);
        } catch (e) {
          console.log(`📦 LocalStorage [${key}]:`, localStorage.getItem(key));
        }
      });
    }
  }, [user, authLoading, studentLoading, student, isOnboarded, error]);
  useEffect(() => {
    setHasOnboardingData(
      OnboardingStorage.exists() && !OnboardingStorage.isExpired()
    );
  }, []);

  if (!authLoading && !user) {
    return <LandingPage />;
  }

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
            onClick={() => {
              console.log('Manual refresh triggered');
              window.location.reload();
            }}
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

  if (studentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center animate-pulse">
            <TreePine className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

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
            onClick={() => router.push("/edit")}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3"
          >
            Complete Your Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10">
        <UserMenu />
      </div>
      <StudentOverview />
    </div>
  );
}
