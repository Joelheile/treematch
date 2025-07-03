"use client";

import { useAuth } from "@/app/auth/AuthProvider";
import { useReferralStats } from "@/integrations/supabase/useReferrals";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Share2, Users, TrendingUp } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ReferralCTA() {
  const { user } = useAuth();
  const { data: stats } = useReferralStats(user?.id);

  if (!user) return null;

  const hasReferrals = (stats?.successfulReferrals || 0) > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 overflow-hidden relative">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {hasReferrals ? "Keep Climbing!" : "Join the Competition!"}
                  </h3>
                  <p className="text-blue-100 text-sm">
                    {hasReferrals 
                      ? `You've referred ${stats?.successfulReferrals} people. Invite more to climb higher!`
                      : "Invite friends to TreeMatch and compete on the leaderboard"
                    }
                  </p>
                </div>
              </div>
              
              {hasReferrals && (
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4" />
                    <span>{stats?.successfulReferrals} referrals</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4" />
                    <span>{stats?.totalReferrals} total invites</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Link href="/referrals">
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Leaderboard
                </Button>
              </Link>
              <Link href="/referrals">
                <Button 
                  size="sm"
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Start Referring
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        </CardContent>
      </Card>
    </motion.div>
  );
}