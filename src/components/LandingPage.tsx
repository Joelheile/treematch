"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertCircle,
  ArrowRight,
  Clock,
  Heart,
  Star,
  Target,
  Timer,
  TreePine,
  Users,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function LandingPage() {
  const router = useRouter();
  const [studentCount, setStudentCount] = useState(0);
  const [weeksLeft, setWeeksLeft] = useState(8);
  const [daysLeft, setDaysLeft] = useState(56);

  const painPoints = [
    "Stuck with your dorm neighbors while missing the startup founder down the hall",
    "That brilliant CS student you briefly met at orientation? Gone forever",
    "The entrepreneur in your econ class who could be your co-founder",
  ];

  const features = [
    { icon: Target, text: "Find builders & entrepreneurs across all majors" },
    { icon: Users, text: "Discover study partners for your specific classes" },
    { icon: Heart, text: "Connect with people who share your interests" },
    {
      icon: Zap,
      text: "Break out of your bubble and meet diverse perspectives",
    },
  ];

  const steps = [
    {
      title: "Quick Setup",
      description:
        "Answer 5 questions about your interests, goals, and what you're building",
      time: "Under 2 minutes",
    },
    {
      title: "Smart Discovery",
      description:
        "Find people by interests, majors, projects, or personality type",
      time: "Browse instantly",
    },
    {
      title: "Real Connections",
      description: "Message, meet up, collaborate, or just grab coffee",
      time: "Connect within hours",
    },
  ];

  const testimonials = [
    {
      quote: "Found my startup co-founder on day 3",
      author: "Sarah, CS Summer Session",
      rating: 5,
    },
    {
      quote: "Connected with 12 entrepreneurs across different majors",
      author: "Mike, Business",
      rating: 5,
    },
    {
      quote: "Finally found people who get my side project",
      author: "Lisa, Engineering",
      rating: 5,
    },
  ];

  const liveActivity = [
    "Alex just connected with 3 other AI researchers",
    "Maya found her study group for CS106A",
    "Jordan matched with 2 startup founders",
    "Priya connected with sustainability researchers",
  ];

  const [currentActivity, setCurrentActivity] = useState(0);

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentActivity((prev) => (prev + 1) % liveActivity.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stanford-red-50 via-white to-stanford-red-100">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-stanford-cardinal rounded-lg flex items-center justify-center">
              <TreePine className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-stanford-cardinal">
              TreeMatch
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Badge
              variant="secondary"
              className="bg-red-100 text-red-700 hidden sm:flex"
            >
              <Timer className="w-3 h-3 mr-1" />
              {weeksLeft} weeks left
            </Badge>
            <Button
              variant="ghost"
              onClick={() => router.push("/auth/login")}
              className="text-stanford-cardinal hover:bg-stanford-red-50"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6 sm:space-y-8 mb-12">
            <Badge
              variant="secondary"
              className="bg-stanford-cardinal text-white"
            >
              <AlertCircle className="w-3 h-3 mr-1" />
              For Stanford Summer Session Students Only
            </Badge>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Don't Waste Your Stanford Summer Session
              <span className="block text-stanford-cardinal">
                on the Same 5 People
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-stanford-gray leading-relaxed max-w-3xl mx-auto">
              Connect with builders, entrepreneurs, and brilliant minds across
              all fields in the Stanford Summer Session.
              <span className="font-semibold text-stanford-cardinal">
                {" "}
                Set up your profile in under 2 minutes.
              </span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-stanford-gray">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>
                  {studentCount} Summer Session students already connected
                </span>
              </div>
              <div className="hidden sm:block w-1 h-1 bg-stanford-gray rounded-full"></div>
              <div className="flex items-center space-x-2 text-red-600 font-medium">
                <Clock className="w-4 h-4" />
                <span>Only {daysLeft} days left in Summer Session</span>
              </div>
            </div>

            <Button
              onClick={() => router.push("/onboarding")}
              className="bg-stanford-cardinal hover:bg-stanford-gold text-white font-bold px-8 py-4 h-auto text-lg rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 min-h-[44px]"
              size="lg"
            >
              Find Your People in 2 Minutes
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Visual Split Screen */}
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <Card className="border-2 border-red-200 bg-red-50/50">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-bold text-red-700 mb-4">
                  Your Current Circle
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-center space-x-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 bg-red-300 rounded-full"
                      ></div>
                    ))}
                  </div>
                  <p className="text-sm text-red-600">
                    Same 5 people from orientation
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 bg-green-50/50">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-bold text-green-700 mb-4">
                  Who You Could Meet
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-6 gap-1">
                    {Array.from({ length: 18 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 bg-green-400 rounded-full"
                      ></div>
                    ))}
                  </div>
                  <p className="text-sm text-green-600">
                    Builders, entrepreneurs, brilliant minds
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="px-4 py-12 bg-white/70">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
            You're Surrounded by Amazing People... But Only Know a Few
          </h2>

          <div className="space-y-4 max-w-2xl mx-auto">
            {painPoints.map((point, index) => (
              <div key={index} className="flex items-start space-x-3 text-left">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-stanford-gray">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="px-4 py-12">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              TreeMatch: Your Stanford Summer Session Network
            </h2>
            <p className="text-stanford-cardinal font-semibold">
              Profile setup: Under 2 minutes. First connections: Within hours.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <CardContent className="p-6 text-center">
                  <feature.icon className="w-10 h-10 text-stanford-cardinal mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-900">
                    {feature.text}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-12 bg-gradient-to-r from-stanford-red-50 to-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Dead Simple Process
            </h2>
          </div>

          <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-stanford-cardinal text-white rounded-xl flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-stanford-gray text-sm mb-2">
                  {step.description}
                </p>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700"
                >
                  {step.time}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="px-4 py-12">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              {studentCount} Summer Session Students Already Connected
            </h2>

            {/* Live Activity */}
            <Card className="border-0 shadow-lg mb-8 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-sm text-green-700 font-medium">
                    {liveActivity[currentActivity]}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-stanford-gold text-stanford-gold"
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 font-medium">
                    "{testimonial.quote}"
                  </p>
                  <p className="text-stanford-cardinal font-semibold text-sm">
                    {testimonial.author}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FOMO Section */}
      <section className="px-4 py-12 bg-gradient-to-r from-red-50 to-orange-50 border-y-2 border-red-200">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 bg-red-100 text-red-700 px-4 py-2 rounded-full font-semibold">
              <Timer className="w-4 h-4" />
              <span>
                Your Stanford Summer Session is Only {weeksLeft} Weeks
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Every Day You Wait is Another Brilliant Person You Won't Meet
            </h2>

            <div className="space-y-3 max-w-2xl mx-auto">
              <p className="text-stanford-gray">
                The best connections happen in the first few weeks
              </p>
              <p className="text-stanford-gray">
                Don't graduate wishing you'd met more people
              </p>
              <p className="text-red-600 font-semibold">
                Limited to current Stanford Summer Session students
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-16 bg-gradient-to-br from-stanford-cardinal to-stanford-gold">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Stop Settling for Your Current Circle
            </h2>
            <p className="text-white/90 text-lg">
              Free for all Stanford Summer Session students
            </p>

            <div className="space-y-4">
              <Button
                onClick={() => router.push("/onboarding")}
                className="bg-white text-stanford-cardinal hover:bg-gray-50 font-bold px-8 py-4 h-auto text-lg rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 min-h-[44px]"
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
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stanford-gray text-white/80 px-4 py-8">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <TreePine className="w-5 h-5" />
              <span className="font-semibold">TreeMatch</span>
            </div>
            <div className="text-sm text-center sm:text-right">
              <p>The essential Stanford Summer Session networking tool</p>
              <p className="text-white/60">Don't waste your 8 weeks</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
