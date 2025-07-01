"use client";

import { useReferralLeaderboard } from "@/integrations/supabase/useReferrals";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Award, User, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState, useCallback } from "react";

export default function ReferralLeaderboard() {
  const { data: leaderboard, isLoading, error, refetch } = useReferralLeaderboard();
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  
  const handleImageError = useCallback((userId: string) => {
    setImageErrors(prev => new Set(prev).add(userId));
  }, []);
  
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Referral Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4 py-8">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
            <div>
              <p className="text-red-600 font-medium">Failed to load leaderboard</p>
              <p className="text-sm text-gray-500 mt-1">Please try again later</p>
            </div>
            <Button 
              onClick={handleRetry} 
              variant="outline" 
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Retrying...' : 'Try Again'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Referral Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Referral Leaderboard
          </CardTitle>
          <CardDescription>
            See who's bringing the most people to TreeMatch!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">
            No referrals yet. Be the first to invite someone!
          </p>
        </CardContent>
      </Card>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-semibold text-gray-500">#{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200";
      case 2:
        return "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200";
      case 3:
        return "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200";
      default:
        return "bg-white border-gray-200";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Referral Leaderboard
        </CardTitle>
        <CardDescription>
          Top referrers who are bringing people to TreeMatch
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {leaderboard.map((entry, index) => {
            const rank = index + 1;
            return (
              <div
                key={entry.referrer_id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-sm ${getRankStyle(rank)}`}
              >
                <div className="flex items-center justify-center w-8 h-8">
                  {getRankIcon(rank)}
                </div>
                
                <div className="flex items-center gap-3 flex-1">
                  {entry.student?.profile_image && !imageErrors.has(entry.referrer_id) ? (
                    <Image
                      src={entry.student.profile_image}
                      alt={entry.student.name || "User"}
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                      onError={() => handleImageError(entry.referrer_id)}
                      unoptimized
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 truncate">
                      {entry.student?.name?.trim() || "Anonymous"}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{entry.count || 0}</p>
                  <p className="text-xs text-gray-500">
                    {(entry.count || 0) === 1 ? "referral" : "referrals"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}