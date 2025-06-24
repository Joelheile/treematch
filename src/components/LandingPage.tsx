"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Clock,
  Heart,
  MessageCircle,
  Star,
  TreePine,
  Users,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function LandingPage() {
  const router = useRouter();
  const [currentCard, setCurrentCard] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [weeksLeft, setWeeksLeft] = useState(8);

  const problemSolutionCards = [
    {
      icon: Users,
      title: "Stuck with the same people?",
      description:
        "You know 5 people. There are 200+ amazing peers you'll never meet.",
      color: "text-stanford-gray",
    },
    {
      icon: MessageCircle,
      title: "Hidden connections everywhere",
      description:
        "That CS major who loves pottery. The pre-med who plays jazz guitar.",
      color: "text-stanford-cardinal",
    },
    {
      icon: Zap,
      title: "TreeMatch finds your tribe",
      description:
        "Smart matching in 2 minutes. Real connections, not small talk.",
      color: "text-stanford-gold",
    },
  ];

  const steps = [
    {
      icon: TreePine,
      title: "Share your vibe",
      description: "Quick questions about interests, goals, and personality",
    },
    {
      icon: Star,
      title: "Smart matching",
      description: "Our algorithm finds your perfect Stanford connections",
    },
    {
      icon: Heart,
      title: "Meet your people",
      description: "Start conversations with peers who truly get you",
    },
  ];

  const testimonials = [
    {
      quote: "Met my study group and best friends through TreeMatch!",
      author: "Sarah, CS '25",
      rating: 5,
    },
    {
      quote: "Found project partners who share my passion for sustainability.",
      author: "Marcus, Environmental Engineering",
      rating: 5,
    },
    {
      quote:
        "Finally connected with other night owls who love late coding sessions.",
      author: "Priya, Math & Philosophy",
      rating: 5,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentCard((prev) => (prev + 1) % problemSolutionCards.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-stanford-red-50 via-white to-stanford-red-100">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-stanford-cardinal rounded-lg flex items-center justify-center">
              <TreePine className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-stanford-cardinal">
              TreeMatch
            </span>
          </div>
          <Button
            variant="ghost"
            onClick={() => router.push("/auth/login")}
            className="text-stanford-cardinal hover:bg-stanford-red-50"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="space-y-6 sm:space-y-8">
            <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-stanford-cardinal to-stanford-gold rounded-2xl flex items-center justify-center shadow-lg">
              <TreePine className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>

            <div className="space-y-4">
              <Badge
                variant="secondary"
                className="bg-stanford-red-100 text-stanford-cardinal hover:bg-stanford-red-100"
              >
                <Clock className="w-3 h-3 mr-1" />
                2-minute setup
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Find Your Stanford
                <span className="block text-stanford-cardinal">
                  Summer Crew
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-stanford-gray leading-relaxed max-w-2xl mx-auto">
                Connect with amazing peers beyond your usual circle.
                <span className="hidden sm:inline">
                  {" "}
                  Smart matching for real friendships, study groups, and project
                  partners.
                </span>
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => router.push("/onboarding")}
                className="bg-stanford-cardinal hover:bg-stanford-gold text-white font-semibold px-8 py-4 h-auto text-lg rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 min-h-[44px]"
                size="lg"
              >
                Join TreeMatch
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <div className="flex items-center justify-center space-x-6 text-sm text-stanford-gray">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{studentCount}+ students</span>
                </div>
                <div className="w-1 h-1 bg-stanford-gray rounded-full"></div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Summer ends in {weeksLeft} weeks</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Cards */}
      <section className="px-4 py-12 bg-white/50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Amazing people everywhere,
              <br />
              <span className="text-stanford-cardinal">
                but you're stuck with the same 5 friends
              </span>
            </h2>
          </div>

          <div className="relative">
            <Card className="border-0 shadow-lg overflow-hidden min-h-[200px]">
              <CardContent className="p-8 text-center">
                {problemSolutionCards.map((card, index) => (
                  <div
                    key={index}
                    className={`transition-all duration-500 ${
                      index === currentCard
                        ? "opacity-100"
                        : "opacity-0 absolute inset-0 p-8"
                    }`}
                  >
                    <card.icon
                      className={`w-12 h-12 mx-auto mb-4 ${card.color}`}
                    />
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {card.title}
                    </h3>
                    <p className="text-stanford-gray leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-center mt-4 space-x-2">
              {problemSolutionCards.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentCard(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentCard
                      ? "bg-stanford-cardinal"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-12">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              How TreeMatch Works
            </h2>
            <p className="text-stanford-gray">
              Three simple steps to find your Stanford tribe
            </p>
          </div>

          <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-stanford-cardinal to-stanford-gold rounded-xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-stanford-cardinal/30 to-transparent transform -translate-x-8"></div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-stanford-gray text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="px-4 py-12 bg-gradient-to-r from-stanford-red-50 to-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <Badge
              variant="secondary"
              className="bg-stanford-cardinal text-white mb-4"
            >
              <Star className="w-3 h-3 mr-1" />
              Student Success Stories
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Join {studentCount}+ Stanford Students
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200"
              >
                <CardContent className="p-6">
                  <div className="flex mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-stanford-gold text-stanford-gold"
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <p className="text-stanford-cardinal font-medium text-sm">
                    {testimonial.author}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-16 bg-gradient-to-br from-stanford-cardinal to-stanford-gold">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Ready to find your Stanford tribe?
            </h2>
            <p className="text-white/90 text-lg">
              Summer's almost over. Don't miss out on amazing connections.
            </p>

            <div className="space-y-4">
              <Button
                onClick={() => router.push("/onboarding")}
                className="bg-white text-stanford-cardinal hover:bg-gray-50 font-semibold px-8 py-4 h-auto text-lg rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 min-h-[44px]"
                size="lg"
              >
                Join TreeMatch Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <p className="text-white/80 text-sm">
                Already have an account?{" "}
                <button
                  onClick={() => router.push("/auth/login")}
                  className="text-white font-medium underline hover:no-underline"
                >
                  Sign in here
                </button>
              </p>
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
              <p>For Stanford Summer Session students</p>
              <p className="text-white/60">
                Built with ❤️ for the Stanford community
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
