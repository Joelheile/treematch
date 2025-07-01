"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/app/auth/AuthProvider";
import { useCreateReferralCode } from "@/integrations/supabase/useReferrals";
import { Button } from "@/components/ui/button";
import { Share2, X, Copy, Users } from "lucide-react";
import { toast } from "sonner";
import { validateUUID } from "@/lib/validation";

export default function FloatingShareButton() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [referralCode, setReferralCode] = useState<string>("");
  const [isClient, setIsClient] = useState(false);
  const createReferralCode = useCreateReferralCode();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        toast.success("Invite link copied to clipboard!");
      } else {
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success("Invite link copied to clipboard!");
      }
    } catch (error) {
      toast.error("Failed to copy link");
    }
  }, []);

  const shareInviteLink = useCallback((code: string) => {
    const inviteLink = `https://treemat.ch/invite/${encodeURIComponent(code)}`;
    const shareData = {
      title: "Join TreeMatch",
      text: "Join me on TreeMatch - the Stanford student project collaboration platform!",
      url: inviteLink,
    };

    if (navigator.share && window.isSecureContext) {
      navigator.share(shareData).catch(() => {
        copyToClipboard(inviteLink);
      });
    } else {
      copyToClipboard(inviteLink);
    }
    setIsOpen(false);
  }, [copyToClipboard]);

  const handleGenerateAndShare = useCallback(async () => {
    if (!user?.id) {
      toast.error("Please log in to share");
      return;
    }
    
    const validUserId = validateUUID(user.id);
    if (!validUserId) {
      toast.error("Invalid user session");
      return;
    }

    if (!referralCode) {
      try {
        const code = await createReferralCode.mutateAsync(validUserId);
        if (code && typeof code === 'string') {
          setReferralCode(code);
          shareInviteLink(code);
        }
      } catch (error) {
        toast.error("Failed to generate invite link");
        return;
      }
    } else {
      shareInviteLink(referralCode);
    }
  }, [user?.id, referralCode, createReferralCode, shareInviteLink]);

  if (!user || !isClient) return null;

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-stanford-cardinal hover:bg-stanford-gold text-white shadow-lg hover:shadow-xl transition-all duration-200 group"
          size="icon"
        >
          <Share2 className="h-6 w-6 group-hover:scale-110 transition-transform" />
        </Button>
      </div>

      {/* Share Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Invite Friends to TreeMatch
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-stanford-red-50 rounded-full flex items-center justify-center mx-auto">
                <Users className="h-8 w-8 text-stanford-cardinal" />
              </div>
              
              <div>
                <p className="text-gray-600 mb-4">
                  Share TreeMatch with your friends and climb the leaderboard! 
                  Every person who joins with your link earns you points.
                </p>
                
                <Button
                  onClick={handleGenerateAndShare}
                  disabled={createReferralCode.isPending}
                  className="w-full bg-stanford-cardinal hover:bg-stanford-gold"
                >
                  {createReferralCode.isPending ? (
                    "Generating..."
                  ) : (
                    <>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share My Invite Link
                    </>
                  )}
                </Button>
                
                {referralCode && (
                  <div className="mt-3">
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(`https://treemat.ch/invite/${referralCode}`)}
                      className="w-full"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}