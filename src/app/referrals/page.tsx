"use client";

import { useAuth } from "@/app/auth/AuthProvider";
import { useCurrentStudent } from "@/hooks/useCurrentStudent";
import { useOnboardingCompletion } from "@/hooks/useOnboardingCompletion";
import { Button } from "@/components/ui/button";
import { Coffee, Edit, Trophy, Share2, LayoutDashboard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import EnhancedLeaderboard from "@/components/referrals/EnhancedLeaderboard";
import InviteShare from "@/components/referrals/InviteShare";
import FloatingShareButton from "@/components/FloatingShareButton";
import LogoutButtonFixed from "@/components/LogoutButtonFixed";

export default function ReferralsPage() {
  const { user, loading: authLoading } = useAuth();
  const { student, isLoading: studentLoading } = useCurrentStudent();
  const { isOnboardingComplete } = useOnboardingCompletion();
  const [showInviteShare, setShowInviteShare] = useState(false);

  if (authLoading || studentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Image src="/logo.png" alt="TreeMatch Logo" width={48} height={48} className="mx-auto animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Trophy className="h-16 w-16 text-gray-400 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">Join the Competition</h2>
          <p className="text-gray-600">Sign in to see the leaderboard and start referring friends!</p>
          <Link href="/auth/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3">
                <Image
                  src="/logo.png"
                  alt="TreeMatch Logo"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="text-xl font-bold text-gray-900">Treematch</span>
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <a
                href="https://coff.ee/treematch"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-amber-100 text-amber-800 hover:bg-amber-200 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-200"
              >
                <Coffee className="w-4 h-4" />
                <span className="hidden sm:inline">Buy us a coffee</span>
                <span className="sm:hidden">Coffee</span>
              </a>
              <Link href="/">
                <Button className="flex items-center gap-2 bg-stanford-red-50 text-stanford-cardinal hover:bg-stanford-red-100 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-200 border-0">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                  <span className="sm:hidden">Dashboard</span>
                </Button>
              </Link>
              <Link href="/edit">
                <Button className={`flex items-center space-x-2 rounded-xl ${
                  isOnboardingComplete 
                    ? "bg-red-600 hover:bg-red-700" 
                    : "bg-orange-600 hover:bg-orange-700"
                }`}>
                  <Edit className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {isOnboardingComplete ? "Edit Profile" : "Complete Onboarding"}
                  </span>
                  <span className="sm:hidden">
                    {isOnboardingComplete ? "Edit" : "Complete"}
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-stanford-cardinal to-stanford-gold rounded-full flex items-center justify-center">
              <Trophy className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏆 Referral Leaderboard
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Compete with fellow Stanford students! Invite friends to TreeMatch and climb the rankings. 
            Every successful referral earns you points and helps grow our community.
          </p>
          
          {/* Prominent Share Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => setShowInviteShare(true)}
              size="lg"
              className="bg-stanford-cardinal hover:bg-stanford-gold text-white font-bold px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Share2 className="h-5 w-5 mr-3" />
              Share Your Invite Link
            </Button>
            <p className="text-sm text-gray-500">
              Every person who joins earns you points!
            </p>
          </div>
        </div>

        {/* Enhanced Leaderboard */}
        <EnhancedLeaderboard />
      </div>

      {/* Floating Share Button */}
      <FloatingShareButton />
      
      {/* Bottom Left Logout Button */}
      <LogoutButtonFixed />

      {/* Invite Share Modal */}
      {showInviteShare && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Share TreeMatch</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInviteShare(false)}
              >
                ✕
              </Button>
            </div>
            <div className="p-4">
              <InviteShare />
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}