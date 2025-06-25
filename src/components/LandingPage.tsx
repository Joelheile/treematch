"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStudents } from "@/integrations/supabase/useStudents";
import { ArrowRight, Clock, Timer, TreePine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function LandingPage() {
  const router = useRouter();
  const { data: students } = useStudents({
    filters: {
      isOnboarded: true
    }
  });
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    isActive: true,
  });

  // Calculate time left until August 17, 2024
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endDate = new Date("2024-08-17T23:59:59");
      const difference = endDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        setTimeLeft({ days, hours, isActive: true });
      } else {
        setTimeLeft({ days: 0, hours: 0, isActive: false });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000 * 60 * 60); // Update every hour
    return () => clearInterval(timer);
  }, []);

  const studentCount = students?.data?.length || 0;

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-stanford-cardinal rounded flex items-center justify-center">
              <TreePine className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-stanford-cardinal">
              TreeMatch
            </span>
          </div>
          <Button
            variant="ghost"
            onClick={() => router.push("/auth/login")}
            className="text-stanford-cardinal hover:bg-gray-50 h-9 px-3 sm:px-4 text-sm sm:text-base"
          >
            Already have an account?
          </Button>
        </div>
      </header>

      <section className="px-3 sm:px-4 py-12 sm:py-16 lg:py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 lg:space-y-12">
          <Badge className="bg-stanford-cardinal text-white text-xs sm:text-sm px-3 py-1">
            For Stanford Summer Session Students Only
          </Badge>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight px-2">
            Your Best Stanford Summer Starts
            <span className="block text-stanford-cardinal mt-1 sm:mt-2">
              with Amazing People
            </span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-2">
            Connect with incredible minds across all fields and interests.
            Discover your people and create unforgettable experiences together.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-8 text-sm text-gray-500 px-2">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="absolute top-0 left-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
              </div>
              <span className="text-center sm:text-left">
                Explore {studentCount} fascinating profiles
              </span>
            </div>
            {timeLeft.isActive && (
              <div className="flex items-center space-x-2 text-red-600 font-medium">
                <Clock className="w-4 h-4" />
                <span>
                  {timeLeft.days} days & {timeLeft.hours} hours left
                </span>
              </div>
            )}
          </div>

          <div className="px-2">
            <Button
              onClick={() => router.push("/onboarding")}
              className="bg-stanford-cardinal hover:bg-red-700 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg h-12 sm:h-14 w-full sm:w-auto"
              size="lg"
            >
              Find Your People
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </section>

      <section className="px-3 sm:px-4 py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-8 sm:mb-12 px-2 leading-tight">
            You're Surrounded by Amazing People... So Get to Know Them!
          </h2>

          <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto">
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                ✨ That person you had a great chat with at the gym? Let's make
                sure you stay connected
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                🌟 The brilliant mind from your study group who shares your
                passions
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                🎉 Someone with completely different interests who could become
                your closest friend
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-3 sm:px-4 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 px-2">
            TreeMatch: Discover Your Stanford Community
          </h2>
          <p className="text-stanford-cardinal font-semibold mb-8 sm:mb-12 lg:mb-16 text-sm sm:text-base px-2">
            Profile setup: Under two minutes. New connections: Within hours.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 lg:gap-12">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-stanford-cardinal text-white rounded-lg flex items-center justify-center mx-auto mb-4 sm:mb-6 font-bold text-lg">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-base sm:text-lg">
                Share Your Story
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Tell others about your interests, passions, and what makes you
                unique
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-stanford-cardinal text-white rounded-lg flex items-center justify-center mx-auto mb-4 sm:mb-6 font-bold text-lg">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-base sm:text-lg">
                Discover People
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Browse through fascinating people with diverse backgrounds and
                interests
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-stanford-cardinal text-white rounded-lg flex items-center justify-center mx-auto mb-4 sm:mb-6 font-bold text-lg">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-base sm:text-lg">
                Make Connections
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Reach out, meet up, explore campus, and create lasting
                friendships
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-3 sm:px-4 py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
            Explore {studentCount} fascinating profiles
          </h2>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base px-2">
            Join the growing community of Stanford Summer Session students
            discovering each other
          </p>
        </div>
      </section>

      <section className="px-3 sm:px-4 py-12 sm:py-16 lg:py-20 bg-stanford-cardinal">
        <div className="max-w-2xl mx-auto text-center space-y-6 sm:space-y-8">
          {timeLeft.isActive && (
            <div className="inline-flex items-center space-x-2 bg-white/10 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base">
              <Timer className="w-4 h-4" />
              <span>
                Only {timeLeft.days} days, {timeLeft.hours} hours left
              </span>
            </div>
          )}

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white px-2 leading-tight">
            Make This Summer Unforgettable
          </h2>

          <p className="text-white/90 text-base sm:text-lg lg:text-xl px-2 leading-relaxed">
            The best memories happen when you step outside your comfort zone.
            Connect with new people and discover experiences you never expected.
          </p>

          <div className="px-2">
            <Button
              onClick={() => router.push("/onboarding")}
              className="bg-white text-stanford-cardinal hover:bg-gray-50 font-bold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg h-12 sm:h-14 w-full sm:w-auto"
              size="lg"
            >
              Start Connecting
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>

          <p className="text-white/80 text-sm sm:text-base mt-4 sm:mt-6 px-2">
            Free for all Stanford Summer Session students
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm text-white/70 pt-6 sm:pt-8 mt-8 sm:mt-12 border-t border-white/20 px-2">
            <div className="flex items-center space-x-2">
              <TreePine className="w-4 h-4" />
              <span className="font-medium">TreeMatch</span>
            </div>
            <p className="text-center">
              Already have an account?{" "}
              <button
                onClick={() => router.push("/auth/login")}
                className="text-white underline hover:no-underline font-medium"
              >
                Sign in here
              </button>
            </p>
          </div>

          <p className="text-white/50 text-xs sm:text-sm mt-4 sm:mt-6 text-center px-2 leading-relaxed">
            No trees were harmed in the making of this network. Side effects may
            include: lifelong friendships, unexpected adventures, and the best
            summer of your life.
          </p>
        </div>
      </section>
    </div>
  );
}
