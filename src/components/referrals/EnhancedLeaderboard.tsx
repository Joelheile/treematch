"use client";

import { useAuth } from "@/app/auth/AuthProvider";
import { useReferralLeaderboard, useReferralStats } from "@/integrations/supabase/useReferrals";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Medal, 
  Award, 
  User, 
  Crown, 
  Star, 
  Zap, 
  Target,
  TrendingUp,
  Users,
  Gift,
  Sparkles,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import Image from "next/image";
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LeaderboardEntry {
  referrer_id: string;
  student: {
    id: string;
    name: string;
    profile_image?: string;
  };
  count: number;
  rank?: number;
  isCurrentUser?: boolean;
}

export default function EnhancedLeaderboard() {
  const { user } = useAuth();
  const { data: leaderboard, isLoading, error, refetch } = useReferralLeaderboard();
  const { data: userStats } = useReferralStats(user?.id);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  const handleImageError = useCallback((userId: string) => {
    setImageErrors(prev => new Set(prev).add(userId));
  }, []);

  // Enhanced leaderboard data with ranks and user highlighting
  const enhancedLeaderboard = leaderboard?.map((entry, index) => ({
    ...entry,
    rank: index + 1,
    isCurrentUser: entry.referrer_id === user?.id
  })) || [];

  const topThree = enhancedLeaderboard.slice(0, 3);
  const restOfLeaderboard = enhancedLeaderboard.slice(3);
  const displayedRest = showAll ? restOfLeaderboard : restOfLeaderboard.slice(0, 7);

  const currentUserEntry = enhancedLeaderboard.find(entry => entry.isCurrentUser);
  const currentUserRank = currentUserEntry?.rank;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankStyle = (rank: number, isCurrentUser: boolean = false) => {
    const baseStyle = isCurrentUser 
      ? "ring-2 ring-stanford-cardinal bg-stanford-red-50 border-stanford-cardinal" 
      : "";
    
    switch (rank) {
      case 1:
        return `bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300 ${baseStyle}`;
      case 2:
        return `bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300 ${baseStyle}`;
      case 3:
        return `bg-gradient-to-r from-amber-50 to-amber-100 border-amber-300 ${baseStyle}`;
      default:
        return `bg-white border-gray-200 hover:bg-stanford-red-50 ${baseStyle}`;
    }
  };

  const getBadge = (rank: number, count: number) => {
    if (rank === 1) return { text: "🔥 Leader", color: "bg-stanford-red-50 text-stanford-cardinal" };
    if (rank <= 3) return { text: "⭐ Top 3", color: "bg-yellow-100 text-yellow-800" };
    if (rank <= 5) return { text: "🚀 Top 5", color: "bg-stanford-red-50 text-stanford-cardinal" };
    if (count >= 10) return { text: "💪 Expert", color: "bg-stanford-red-100 text-stanford-cardinal" };
    if (count >= 5) return { text: "📈 Rising", color: "bg-stanford-red-50 text-stanford-cardinal" };
    return { text: "🌱 Starter", color: "bg-gray-100 text-gray-800" };
  };

  if (error) {
    return (
      <div className="text-center space-y-6 py-12">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <Trophy className="h-10 w-10 text-red-500" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to load leaderboard</h3>
          <p className="text-gray-600 mb-4">We're having trouble loading the latest rankings.</p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Stats Loading */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-12"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Podium Loading */}
        <Card className="animate-pulse">
          <CardContent className="p-8">
            <div className="flex justify-center items-end space-x-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* List Loading */}
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-8"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Your Rank</p>
                <p className="text-3xl font-bold text-gray-900">
                  {currentUserRank ? `#${currentUserRank}` : 'Unranked'}
                </p>
              </div>
              <div className="w-12 h-12 bg-stanford-red-50 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-stanford-cardinal" />
              </div>
            </div>
            {currentUserRank && (
              <Badge className={`mt-2 ${getBadge(currentUserRank, userStats?.successfulReferrals || 0).color}`}>
                {getBadge(currentUserRank, userStats?.successfulReferrals || 0).text}
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Successful Referrals</p>
                <p className="text-3xl font-bold text-stanford-cardinal">
                  {userStats?.successfulReferrals || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-stanford-red-50 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-stanford-cardinal" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invites</p>
                <p className="text-3xl font-bold text-stanford-cardinal">
                  {userStats?.totalReferrals || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-stanford-red-50 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-stanford-cardinal" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Podium Section */}
      {topThree.length > 0 && (
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Sparkles className="h-6 w-6 text-yellow-500" />
              Top Performers
              <Sparkles className="h-6 w-6 text-yellow-500" />
            </CardTitle>
            <CardDescription>Our most successful referrers this period</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex justify-center items-end space-x-8">
              {/* Second Place */}
              {topThree[1] && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-center"
                >
                  <div className="relative">
                    <div className="w-16 h-16 relative mb-3">
                      {topThree[1].student?.profile_image && !imageErrors.has(topThree[1].referrer_id) ? (
                        <Image
                          src={topThree[1].student.profile_image}
                          alt={topThree[1].student.name || "User"}
                          width={64}
                          height={64}
                          className="rounded-full object-cover border-4 border-gray-300"
                          onError={() => handleImageError(topThree[1].referrer_id)}
                          unoptimized
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center border-4 border-gray-300">
                          <User className="h-8 w-8 text-gray-500" />
                        </div>
                      )}
                      <div className="absolute -top-2 -right-2">
                        <Medal className="h-6 w-6 text-gray-400" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 truncate max-w-20">
                      {topThree[1].student?.name || "Anonymous"}
                    </h3>
                    <p className="text-2xl font-bold text-gray-600">{topThree[1].count}</p>
                    <div className="w-20 h-16 bg-gray-200 rounded-t-lg mx-auto mt-2"></div>
                  </div>
                </motion.div>
              )}

              {/* First Place */}
              {topThree[0] && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div className="relative">
                    <div className="w-20 h-20 relative mb-3">
                      {topThree[0].student?.profile_image && !imageErrors.has(topThree[0].referrer_id) ? (
                        <Image
                          src={topThree[0].student.profile_image}
                          alt={topThree[0].student.name || "User"}
                          width={80}
                          height={80}
                          className="rounded-full object-cover border-4 border-yellow-400"
                          onError={() => handleImageError(topThree[0].referrer_id)}
                          unoptimized
                        />
                      ) : (
                        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center border-4 border-yellow-400">
                          <User className="h-10 w-10 text-yellow-600" />
                        </div>
                      )}
                      <div className="absolute -top-3 -right-3">
                        <Crown className="h-8 w-8 text-yellow-500" />
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 truncate max-w-24">
                      {topThree[0].student?.name || "Anonymous"}
                    </h3>
                    <p className="text-3xl font-bold text-yellow-600">{topThree[0].count}</p>
                    <div className="w-24 h-20 bg-yellow-200 rounded-t-lg mx-auto mt-2"></div>
                  </div>
                </motion.div>
              )}

              {/* Third Place */}
              {topThree[2] && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <div className="relative">
                    <div className="w-14 h-14 relative mb-3">
                      {topThree[2].student?.profile_image && !imageErrors.has(topThree[2].referrer_id) ? (
                        <Image
                          src={topThree[2].student.profile_image}
                          alt={topThree[2].student.name || "User"}
                          width={56}
                          height={56}
                          className="rounded-full object-cover border-4 border-amber-300"
                          onError={() => handleImageError(topThree[2].referrer_id)}
                          unoptimized
                        />
                      ) : (
                        <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center border-4 border-amber-300">
                          <User className="h-7 w-7 text-amber-600" />
                        </div>
                      )}
                      <div className="absolute -top-2 -right-2">
                        <Award className="h-5 w-5 text-amber-600" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 truncate max-w-16">
                      {topThree[2].student?.name || "Anonymous"}
                    </h3>
                    <p className="text-xl font-bold text-amber-600">{topThree[2].count}</p>
                    <div className="w-16 h-12 bg-amber-200 rounded-t-lg mx-auto mt-2"></div>
                  </div>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Complete Rankings
          </CardTitle>
          <CardDescription>
            See where everyone stands in the referral competition
          </CardDescription>
        </CardHeader>
        <CardContent>
          {enhancedLeaderboard.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No rankings yet</h3>
              <p className="text-gray-600">Be the first to invite someone and claim the top spot!</p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {displayedRest.map((entry, index) => (
                  <motion.div
                    key={entry.referrer_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-sm ${getRankStyle(entry.rank!, entry.isCurrentUser)}`}
                  >
                    <div className="flex items-center justify-center w-10 h-10">
                      {getRankIcon(entry.rank!)}
                    </div>
                    
                    <div className="flex items-center gap-3 flex-1">
                      {entry.student?.profile_image && !imageErrors.has(entry.referrer_id) ? (
                        <Image
                          src={entry.student.profile_image}
                          alt={entry.student.name || "User"}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                          onError={() => handleImageError(entry.referrer_id)}
                          unoptimized
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 truncate">
                            {entry.student?.name?.trim() || "Anonymous"}
                            {entry.isCurrentUser && (
                              <span className="text-blue-600 font-semibold"> (You)</span>
                            )}
                          </p>
                          <Badge className={getBadge(entry.rank!, entry.count).color}>
                            {getBadge(entry.rank!, entry.count).text}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">{entry.count || 0}</p>
                      <p className="text-xs text-gray-500">
                        {(entry.count || 0) === 1 ? "referral" : "referrals"}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {restOfLeaderboard.length > 7 && (
                <div className="text-center pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => setShowAll(!showAll)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {showAll ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-1" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1" />
                        Show {restOfLeaderboard.length - 7} More
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}