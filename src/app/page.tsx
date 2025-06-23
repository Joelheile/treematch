"use client";

import { StudentOverview } from "@/components/StudentOverview";
import { UserMenu } from "@/components/UserMenu";
import { useRouter } from "next/navigation";
import { useCurrentStudent } from "@/hooks/useCurrentStudent";
import { useAuth } from "@/app/auth/AuthProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { TreePine } from "lucide-react";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { isOnboarded, isLoading: studentLoading, error } = useCurrentStudent();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [authLoading, user, router]);

  if (authLoading || (!user && !authLoading)) {
    return null;
  }

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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-600 rounded-xl flex items-center justify-center">
            <TreePine className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Welcome to Treematch!</h1>
            <p className="text-gray-600">Let's set up your profile to get started.</p>
          </div>
          <button 
            onClick={() => router.push('/onboarding')}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Complete Your Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10">
        <UserMenu />
      </div>
      {!isOnboarded ? (
        (() => {
          router.push('/onboarding');
          return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Redirecting to onboarding...</h1>
              </div>
            </div>
          );
        })()
      ) : (
        <StudentOverview />
      )}
    </div>
  );
}
