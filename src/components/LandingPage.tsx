"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Users, Search, Heart, ExternalLink, Coffee, Trophy } from "lucide-react";

export function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation buttons */}
      <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
        <a 
          href="https://coff.ee/treematch" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-amber-100 text-amber-800 hover:bg-amber-200 px-3 py-2 rounded-full text-sm font-medium transition-colors duration-200"
        >
          <Coffee className="w-4 h-4" />
          <span>Buy us a coffee</span>
        </a>
        <Button
          variant="ghost"
          onClick={() => router.push("/referrals")}
          className="flex items-center gap-2 bg-stanford-red-50 text-stanford-cardinal hover:bg-stanford-red-100 px-3 py-2 rounded-full text-sm font-medium transition-colors duration-200"
        >
          <Trophy className="w-4 h-4" />
          <span>Leaderboard</span>
        </Button>
      </div>
      <div className="absolute top-6 right-6 z-10">
        <Button
          variant="ghost"
          onClick={() => router.push("/auth/login")}
          className="text-stanford-cardinal hover:bg-stanford-red-50 font-medium"
        >
          Sign In
        </Button>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-stanford-red-50 to-white"></div>
        
        {/* Content */}
        <div className="relative px-6 py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            {/* Large Logo */}
            <div className="mb-8 sm:mb-12 mt-12">
              <Image 
                src="/logo.png" 
                alt="TreeMatch" 
                width={120} 
                height={120} 
                className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 mx-auto"
              />
            </div>
            
            {/* Main headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-8 leading-tight">
              Meet every amazing person in{" "}
              <span className="text-stanford-cardinal">Stanford Summer Session</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              A directory of all summer students. Create your profile, discover people by their skills and interests, and actually get to know each other.
            </p>

            {/* CTA Button */}
            <Button
              onClick={() => router.push("/edit")}
              className="bg-stanford-cardinal hover:bg-stanford-gold text-white font-semibold px-10 py-5 text-xl rounded-full shadow-lg hover:shadow-xl transition-all duration-200 mb-6"
              size="lg"
            >
              Join TreeMatch
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>

          </div>
        </div>
      </div>

      {/* Why Section with Builders Photo */}
      <div className="px-6 py-16 sm:py-20 bg-gray-50">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
              Why we built this
            </h2>
            
            {/* Builders Image */}
            <div className="mb-12">
              <div className="relative mx-auto w-80 h-60 sm:w-96 sm:h-72 rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/group-image.jpg"
                  alt="TreeMatch Builders"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="text-sm text-gray-500 mt-4 space-y-1">
                <p className="italic">The TreeMatch team</p>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-stanford-cardinal">
                  <a 
                    href="https://www.linkedin.com/in/joel-heil-escobar/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline flex items-center gap-1"
                  >
                    Joel <ExternalLink className="w-3 h-3" />
                  </a>
                  <a 
                    href="https://www.linkedin.com/in/leonarddarsow/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline flex items-center gap-1"
                  >
                    Leonard <ExternalLink className="w-3 h-3" />
                  </a>
                  <a 
                    href="https://www.linkedin.com/in/simon-gneuss/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline flex items-center gap-1"
                  >
                    Simon <ExternalLink className="w-3 h-3" />
                  </a>
                  <a 
                    href="https://www.linkedin.com/in/nicholas-rodrigues-/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline flex items-center gap-1"
                  >
                    Nicholas <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="text-xl sm:text-2xl text-gray-700 leading-relaxed space-y-6 max-w-3xl mx-auto">
              <p>
                Stanford Summer Session brings together incredible people from all over the world. But here's the thing:
              </p>
              <p className="font-medium text-gray-900">
                <span className="text-stanford-cardinal">There are so many cool people you could meet, but never enough time to meet everyone.</span>
              </p>
              <p>
                So we built TreeMatch to help you find and connect with all the people who are actually relevant to you. No more missed connections.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              How it works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to start meeting amazing people
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid gap-8 lg:gap-12 lg:grid-cols-3">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-20 h-20 bg-gradient-to-br from-stanford-cardinal to-stanford-gold rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10 text-white" />
              </div>
              <div className="text-2xl font-bold text-stanford-cardinal mb-2">01</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Build your profile
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Share your academic interests, current projects, skills you're developing, and what makes you unique. The more authentic, the better connections you'll make.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-20 h-20 bg-gradient-to-br from-stanford-cardinal to-stanford-gold rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Search className="w-10 h-10 text-white" />
              </div>
              <div className="text-2xl font-bold text-stanford-cardinal mb-2">02</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Discover your people
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Browse through students by skills, interests, courses, or goals. Use filters to find exactly who you're looking for, or explore randomly for serendipitous connections.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-20 h-20 bg-gradient-to-br from-stanford-cardinal to-stanford-gold rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <div className="text-2xl font-bold text-stanford-cardinal mb-2">03</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Connect & meet up
              </h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Reach out to people who intrigue you. Grab coffee at Coupa, study together at Green Library, explore campus, or start a project together.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-6 py-16 sm:py-20 bg-stanford-cardinal">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Your summer just got more interesting
          </h2>
          <p className="text-xl text-white/90 mb-10 leading-relaxed">
            Don't spend another day wondering "who are all these amazing people?" Join TreeMatch and start connecting.
          </p>
          <Button
            onClick={() => router.push("/edit")}
            className="bg-white text-stanford-cardinal hover:bg-gray-50 font-bold px-10 py-5 text-xl rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            size="lg"
          >
            Create Your Profile
            <ArrowRight className="ml-3 h-6 w-6" />
          </Button>
          
          <div className="mt-8 text-white/70 text-lg">
            takes 2 minutes
          </div>
        </div>
      </div>


    </div>
  );
}
