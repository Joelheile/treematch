"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/app/auth/AuthProvider";
import { useCreateReferralCode, useReferralStats } from "@/integrations/supabase/useReferrals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Share2, Users, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { validateUUID } from "@/lib/validation";

export default function InviteShare() {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<string>("");
  const [isClient, setIsClient] = useState(false);
  const createReferralCode = useCreateReferralCode();
  const { data: stats, error: statsError } = useReferralStats(user?.id);
  
  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleGenerateCode = useCallback(async () => {
    if (!user?.id) {
      toast.error("Please log in to generate a referral code");
      return;
    }
    
    const validUserId = validateUUID(user.id);
    if (!validUserId) {
      toast.error("Invalid user session. Please log in again.");
      return;
    }
    
    try {
      const code = await createReferralCode.mutateAsync(validUserId);
      if (code && typeof code === 'string') {
        setReferralCode(code);
        toast.success("Referral code generated!");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error('Generate referral code error:', error);
      const message = error instanceof Error ? error.message : "Failed to generate referral code";
      toast.error(message);
    }
  }, [user?.id, createReferralCode]);

  const inviteLink = referralCode && isClient ? `https://treemat.ch/invite/${encodeURIComponent(referralCode)}` : "";

  const handleCopyLink = useCallback(async () => {
    if (!inviteLink) {
      toast.error("No invite link to copy");
      return;
    }
    
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(inviteLink);
        toast.success("Invite link copied to clipboard!");
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = inviteLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success("Invite link copied to clipboard!");
      }
    } catch (error) {
      console.error('Copy link error:', error);
      toast.error("Failed to copy link");
    }
  }, [inviteLink]);

  const handleShare = useCallback(async () => {
    if (!inviteLink) {
      toast.error("No invite link to share");
      return;
    }
    
    const shareData = {
      title: "Join TreeMatch",
      text: "Join me on TreeMatch - the Stanford student project collaboration platform!",
      url: inviteLink,
    };

    if (navigator.share && window.isSecureContext) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  }, [inviteLink, handleCopyLink]);

  if (!user) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto" />
            <p className="text-sm text-gray-500">Please log in to access referral features</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!isClient) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Invite Friends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-gray-200 rounded-lg"></div>
              <div className="h-16 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (statsError) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <AlertCircle className="h-8 w-8 text-red-400 mx-auto" />
            <p className="text-sm text-red-600">Failed to load referral data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Invite Friends
        </CardTitle>
        <CardDescription>
          Share TreeMatch with your friends and compete on the leaderboard!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats ? (
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {stats.successfulReferrals || 0}
              </p>
              <p className="text-sm text-blue-600">Successful Referrals</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {stats.totalReferrals || 0}
              </p>
              <p className="text-sm text-green-600">Total Invites</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-center animate-pulse">
            <div className="p-3 bg-gray-100 rounded-lg">
              <div className="h-8 bg-gray-200 rounded w-8 mx-auto mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-20 mx-auto"></div>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <div className="h-8 bg-gray-200 rounded w-8 mx-auto mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
            </div>
          </div>
        )}

        {!referralCode ? (
          <Button 
            onClick={handleGenerateCode} 
            disabled={createReferralCode.isPending}
            className="w-full"
          >
            {createReferralCode.isPending ? "Generating..." : "Generate Invite Link"}
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={inviteLink}
                readOnly
                className="flex-1"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={handleCopyLink}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={handleShare}
              className="w-full"
              variant="default"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Invite Link
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}