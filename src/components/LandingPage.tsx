"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStudents } from "@/integrations/supabase/useStudents";
import { ArrowRight, Clock, Timer, TreePine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function LandingPage() {
  const router = useRouter();
  const { data: students } = useStudents();
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-stanford-cardinal rounded flex items-center justify-center">
              <TreePine className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-stanford-cardinal">
              TreeMatch
            </span>
          </div>
          <Button
            variant="ghost"
            onClick={() => router.push("/auth/login")}
            className="text-stanford-cardinal hover:bg-gray-50"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-12">
          <Badge className="bg-stanford-cardinal text-white">
            For Stanford Summer Session Students Only
          </Badge>

          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 leading-tight">
            Don't Waste Your Stanford Summer
            <span className="block text-stanford-cardinal mt-2">
              on the Same 5 People
            </span>
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Connect with builders, entrepreneurs, and brilliant minds across all
            fields. Set up your profile in under two minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="absolute top-0 left-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
              </div>
              <span>{studentCount} from 500+ Summer Session students</span>
            </div>
            {timeLeft.isActive && (
              <div className="flex items-center space-x-2 text-red-600 font-medium">
                <Clock className="w-4 h-4" />
                <span>
                  {timeLeft.days} days, {timeLeft.hours} hours left
                </span>
              </div>
            )}
          </div>

          <Button
            onClick={() => router.push("/onboarding")}
            className="bg-stanford-cardinal hover:bg-red-700 text-white font-semibold px-8 py-4 text-lg mt-8"
            size="lg"
          >
            Find Your People in Two Minutes
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Problem */}
      <section className="px-4 py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-12">
            You're Surrounded by Amazing People... But Only Know a Few
          </h2>

          <div className="space-y-6 max-w-2xl mx-auto text-left">
            <div>
              <p className="text-gray-600 leading-relaxed">
                😔 Stuck with your dorm neighbors while missing the startup
                founder down the hall
              </p>
            </div>
            <div>
              <p className="text-gray-600 leading-relaxed">
                💭 That brilliant CS student you briefly met at orientation?
                Gone forever
              </p>
            </div>
            <div>
              <p className="text-gray-600 leading-relaxed">
                🤝 The entrepreneur in your econ class who could be your
                co-founder
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            TreeMatch: Your Stanford Summer Network
          </h2>
          <p className="text-stanford-cardinal font-semibold mb-16">
            Profile setup: Under two minutes. First connections: Within hours.
          </p>

          <div className="grid sm:grid-cols-3 gap-12">
            <div>
              <div className="w-12 h-12 bg-stanford-cardinal text-white rounded flex items-center justify-center mx-auto mb-6 font-bold text-lg">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-3">Quick Setup</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Answer 5 questions about your interests and goals
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-stanford-cardinal text-white rounded flex items-center justify-center mx-auto mb-6 font-bold text-lg">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Browse Students
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Find people by interests, majors, and projects
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-stanford-cardinal text-white rounded flex items-center justify-center mx-auto mb-6 font-bold text-lg">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-3">Connect</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Message, meet up, collaborate, or grab coffee
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Counter */}
      <section className="px-4 py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            {studentCount} from 500+ Summer Session Students
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Join the growing network of Stanford Summer Session students
          </p>
        </div>
      </section>

      {/* Final CTA & Footer */}
      <section className="px-4 py-20 bg-stanford-cardinal">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {timeLeft.isActive && (
            <div className="inline-flex items-center space-x-2 bg-white/10 text-white px-6 py-3 rounded-full font-semibold">
              <Timer className="w-4 h-4" />
              <span>
                Only {timeLeft.days} days, {timeLeft.hours} hours left
              </span>
            </div>
          )}

          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Stop Settling for Your Current Circle
          </h2>

          <p className="text-white/90 text-lg">
            The best connections happen in the first few weeks. Don't graduate
            wishing you'd met more people.
          </p>

          <Button
            onClick={() => router.push("/onboarding")}
            className="bg-white text-stanford-cardinal hover:bg-gray-50 font-bold px-8 py-4 text-lg mt-8"
            size="lg"
          >
            Join TreeMatch Now - Two-Minute Setup
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <p className="text-white/80 text-sm mt-6">
            Free for all Stanford Summer Session students
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-white/70 pt-8 mt-12 border-t border-white/20">
            <div className="flex items-center space-x-2">
              <TreePine className="w-4 h-4" />
              <span className="font-medium">TreeMatch</span>
            </div>
            <p className="text-center">
              Already have an account?{" "}
              <button
                onClick={() => router.push("/auth/login")}
                className="text-white underline hover:no-underline"
              >
                Sign in here
              </button>
            </p>
          </div>

          <p className="text-white/50 text-xs mt-6 text-center">
            No trees were harmed in the making of this network. Side effects may
            include: making friends, starting companies, and having an amazing
            summer.
          </p>
        </div>
      </section>
    </div>
  );
}
