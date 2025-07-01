"use client";

import { useAuth } from "@/app/auth/AuthProvider";
import { LandingPage } from "@/components/LandingPage";
import { StudentOverview } from "@/components/StudentOverview";
import { Button } from "@/components/ui/button";
import LogoutButtonFixed from "@/components/LogoutButtonFixed";
import { useCurrentStudent } from "@/hooks/useCurrentStudent";
import { TreePine } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/integrations/supabase/server";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

// Loading component
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
      <div className="text-center space-y-4">
        <Image src="/logo.png" alt="TreeMatch Logo" width={48} height={48} className="mx-auto animate-pulse" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { student, isOnboarded, isLoading: studentLoading, error } = useCurrentStudent();

  // Show loading state while auth or student data is loading
  if (authLoading || (user && studentLoading)) {
    return <LoadingSpinner />;
  }

  // Show landing page for unauthenticated users
  if (!user) {
    return <LandingPage />;
  }

  // Show onboarding prompt if user is not onboarded
  if (error || !isOnboarded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <div className="text-center space-y-4">
          <Image src="/logo.png" alt="TreeMatch Logo" width={64} height={64} className="mx-auto" />
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
      <LogoutButtonFixed />
      <StudentOverview />
    </div>
  );
}
