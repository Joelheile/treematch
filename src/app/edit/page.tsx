"use client";

import { useAuth } from "@/app/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { useCurrentStudent } from "@/hooks/useCurrentStudent";
import OnboardingLogic from "@/components/onboarding/OnboardingLogic";
import { ArrowLeft, Edit3, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EditPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { student, isOnboarded, isLoading: studentLoading } = useCurrentStudent();

  if (authLoading || studentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (user && isOnboarded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <Edit3 className="w-8 h-8 text-blue-600" />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Profile Already Complete
            </h1>
            <p className="text-gray-600">
              Your profile is all set up! You can make changes through your profile settings or start exploring matches.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">{student?.name}</p>
                <p className="text-sm text-gray-500">{student?.email}</p>
              </div>
            </div>
            
            <div className="pt-2 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                Profile created and ready to use
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => router.push("/")}
              className="bg-red-600 hover:bg-red-700 text-white font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Matches
            </Button>
            <Button
              onClick={() => window.location.href = "/"}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              View My Profile
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <OnboardingLogic />;
}
