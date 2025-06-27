"use client";

import { useAuth } from "@/app/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { useCurrentStudent } from "@/hooks/useCurrentStudent";
import { CheckCircle, Sparkles, Users, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function WelcomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { student, isOnboarded, isLoading } = useCurrentStudent();
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || !isOnboarded)) {
      router.push("/");
      return;
    }
    
    const timer = setTimeout(() => setShowAnimation(true), 500);
    return () => clearTimeout(timer);
  }, [user, isOnboarded, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user || !isOnboarded) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className={`transition-all duration-1000 ${showAnimation ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-green-100 rounded-full animate-pulse"></div>
            </div>
            <div className="relative flex items-center justify-center">
              <CheckCircle className="w-20 h-20 text-green-600 animate-bounce" />
            </div>
            <div className="absolute top-0 right-8 animate-bounce delay-300">
              <Sparkles className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="absolute bottom-0 left-8 animate-bounce delay-700">
              <Sparkles className="w-4 h-4 text-red-500" />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Welcome to Treematch! 🎉
              </h1>
              <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>Profile Complete</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-red-600 rounded-xl flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="TreeMatch"
                    width={40}
                    height={40}
                    className="w-10 h-10"
                  />
                </div>
              </div>
              
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Hey {student?.name?.split(' ')[0] || 'there'}! 👋
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Your profile is all set up and ready to go. You can now discover and connect 
                with other Stanford students who share your interests, skills, and goals.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <Users className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-1">Find Your Match</h3>
                  <p className="text-sm text-gray-600">Discover students with similar interests</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Sparkles className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-1">Share Skills</h3>
                  <p className="text-sm text-gray-600">Connect through your expertise</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-1">Achieve Goals</h3>
                  <p className="text-sm text-gray-600">Work together on projects</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => router.push("/")}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 h-auto text-lg group"
                >
                  Explore Matches
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  onClick={() => router.push("/edit")}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium px-8 py-3 h-auto text-lg"
                >
                  Edit Profile
                </Button>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              You can always update your profile later in your settings
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 