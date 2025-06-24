"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ArrowRight,
  Clock,
  Star,
  Timer,
  TreePine,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function LandingPage() {
  const router = useRouter();
  const [studentCount, setStudentCount] = useState(0);
  const [daysLeft, setDaysLeft] = useState(56);

  const testimonials = [
    {
      quote: "Found my startup co-founder on day 3",
      author: "Sarah, CS",
    },
    {
      quote: "Connected with 12 entrepreneurs across majors",
      author: "Mike, Business",
    },
    {
      quote: "Finally found people who get my side project",
      author: "Lisa, Engineering",
    },
  ];

  useEffect(() => {
    const countUp = () => {
      const target = 247;
      const increment = target / 50;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setStudentCount(target);
          clearInterval(timer);
        } else {
          setStudentCount(Math.floor(current));
        }
      }, 50);
    };
    countUp();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
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
      <section className="px-4 py-12 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <Badge className="bg-stanford-cardinal text-white">
            For Stanford Summer Session Students Only
          </Badge>

          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 leading-tight">
            Don't Waste Your Stanford Summer
            <span className="block text-stanford-cardinal">
              on the Same 5 People
            </span>
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with builders, entrepreneurs, and brilliant minds across all
            fields. Set up your profile in under 2 minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{studentCount} students connected</span>
            </div>
            <div className="flex items-center space-x-2 text-red-600 font-medium">
              <Clock className="w-4 h-4" />
              <span>Only {daysLeft} days left</span>
            </div>
          </div>

          <Button
            onClick={() => router.push("/onboarding")}
            className="bg-stanford-cardinal hover:bg-red-700 text-white font-semibold px-8 py-3 text-lg"
            size="lg"
          >
            Find Your People in 2 Minutes
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Problem */}
      <section className="px-4 py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
            You're Surrounded by Amazing People... But Only Know a Few
          </h2>

          <div className="space-y-4 max-w-2xl mx-auto text-left">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-gray-600">
                Stuck with your dorm neighbors while missing the startup founder
                down the hall
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-gray-600">
                That brilliant CS student you briefly met at orientation? Gone
                forever
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-gray-600">
                The entrepreneur in your econ class who could be your co-founder
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            TreeMatch: Your Stanford Summer Network
          </h2>
          <p className="text-stanford-cardinal font-semibold mb-12">
            Profile setup: Under 2 minutes. First connections: Within hours.
          </p>

          <div className="grid sm:grid-cols-3 gap-8">
            <div>
              <div className="w-12 h-12 bg-stanford-cardinal text-white rounded flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Quick Setup</h3>
              <p className="text-sm text-gray-600">
                Answer 5 questions about your interests and goals
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-stanford-cardinal text-white rounded flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Browse Students
              </h3>
              <p className="text-sm text-gray-600">
                Find people by interests, majors, and projects
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-stanford-cardinal text-white rounded flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Connect</h3>
              <p className="text-sm text-gray-600">
                Message, meet up, collaborate, or grab coffee
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="px-4 py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {studentCount} Summer Session Students Connected
            </h2>
            <div className="flex items-center justify-center space-x-2 text-sm text-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Alex just connected with 3 AI researchers</span>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="border border-gray-200 bg-white p-6 rounded"
              >
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 font-medium">
                  "{testimonial.quote}"
                </p>
                <p className="text-stanford-cardinal font-semibold text-sm">
                  {testimonial.author}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOMO */}
      <section className="px-4 py-12 bg-red-50 border-y border-red-200">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 bg-red-100 text-red-700 px-4 py-2 rounded-full font-semibold">
            <Timer className="w-4 h-4" />
            <span>Summer Session: Only 8 Weeks</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Every Day You Wait is Another Brilliant Person You Won't Meet
          </h2>

          <p className="text-gray-600 max-w-2xl mx-auto">
            The best connections happen in the first few weeks. Don't graduate
            wishing you'd met more people.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-16 bg-stanford-cardinal">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Stop Settling for Your Current Circle
          </h2>
          <p className="text-white/90 text-lg">
            Free for all Stanford Summer Session students
          </p>

          <Button
            onClick={() => router.push("/onboarding")}
            className="bg-white text-stanford-cardinal hover:bg-gray-50 font-bold px-8 py-4 text-lg"
            size="lg"
          >
            Join TreeMatch Now - 2 Minute Setup
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <div className="space-y-2">
            <p className="text-white/80 text-sm">
              Already have an account?{" "}
              <button
                onClick={() => router.push("/auth/login")}
                className="text-white font-medium underline hover:no-underline"
              >
                Sign in here
              </button>
            </p>
            <button className="text-white/90 text-sm underline hover:no-underline">
              See who's already here
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white/80 px-4 py-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <TreePine className="w-5 h-5" />
            <span className="font-semibold">TreeMatch</span>
          </div>
          <div className="text-sm text-center sm:text-right">
            <p>The essential Stanford Summer Session networking tool</p>
            <p className="text-white/60">Don't waste your 8 weeks</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
