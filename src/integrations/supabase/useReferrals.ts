import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "./client-ssr";
import type { Tables } from "./types";
import { validateUUID } from "@/lib/validation";

type Referral = Tables<"referrals">;

export function useCreateReferralCode() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string): Promise<string> => {
      // Validate input
      const validUserId = validateUUID(userId);
      if (!validUserId) {
        throw new Error("Invalid user ID format");
      }
      
      const supabase = createClient();
      
      const { data, error } = await supabase
        .rpc('create_user_referral_code', { user_id: validUserId });
      
      if (error) {
        console.error('Create referral code error:', error);
        throw new Error(error.message || "Failed to create referral code");
      }
      
      if (!data || typeof data !== 'string') {
        throw new Error("Invalid response from server");
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
    },
  });
}

export function useUserReferrals(userId?: string) {
  return useQuery({
    queryKey: ['referrals', userId],
    queryFn: async (): Promise<Referral[]> => {
      const validUserId = validateUUID(userId);
      if (!validUserId) return [];
      
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', validUserId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Fetch user referrals error:', error);
        throw new Error("Failed to fetch referrals");
      }
      return data || [];
    },
    enabled: !!userId && !!validateUUID(userId),
    staleTime: 30000, // 30 seconds
    retry: 2,
  });
}

export function useReferralStats(userId?: string) {
  return useQuery({
    queryKey: ['referral-stats', userId],
    queryFn: async (): Promise<{ totalReferrals: number; successfulReferrals: number }> => {
      const validUserId = validateUUID(userId);
      if (!validUserId) return { totalReferrals: 0, successfulReferrals: 0 };
      
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('referrals')
        .select('is_used')
        .eq('referrer_id', validUserId);
      
      if (error) {
        console.error('Fetch referral stats error:', error);
        return { totalReferrals: 0, successfulReferrals: 0 };
      }
      
      const totalReferrals = data?.length || 0;
      const successfulReferrals = data?.filter(r => r.is_used).length || 0;
      
      return { totalReferrals, successfulReferrals };
    },
    enabled: !!userId && !!validateUUID(userId),
    staleTime: 60000, // 1 minute
    retry: 1,
  });
}

export function useReferralLeaderboard() {
  return useQuery({
    queryKey: ['referral-leaderboard'],
    queryFn: async () => {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('referrals')
        .select(`
          referrer_id,
          students!referrals_referrer_id_fkey (
            id,
            name,
            profile_image
          )
        `)
        .eq('is_used', true);
      
      if (error) {
        console.error('Fetch leaderboard error:', error);
        return [];
      }
      
      if (!data) return [];
      
      // Group by referrer and count successful referrals
      const leaderboardMap = new Map();
      
      data.forEach((referral) => {
        const referrerId = referral.referrer_id;
        if (!referrerId) return; // Skip invalid data
        
        if (!leaderboardMap.has(referrerId)) {
          leaderboardMap.set(referrerId, {
            referrer_id: referrerId,
            student: referral.students,
            count: 0
          });
        }
        leaderboardMap.get(referrerId).count += 1;
      });
      
      // Convert to array and sort by count
      const leaderboard = Array.from(leaderboardMap.values())
        .filter(entry => entry.count > 0) // Only include users with referrals
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10
      
      return leaderboard;
    },
    staleTime: 300000, // 5 minutes
    retry: 1,
  });
}