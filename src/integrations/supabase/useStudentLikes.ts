import { useAuth } from "@/app/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Tables } from "@/integrations/supabase/types";

export type StudentLike = Tables<"student_likes">;

export const useStudentLikes = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: likedStudentIds = [], isLoading } = useQuery({
    queryKey: ["student-likes", user?.id],
    queryFn: async (): Promise<string[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("student_likes")
        .select("liked_student_id")
        .eq("liker_id", user.id);

      if (error) throw error;
      return data?.map((like) => like.liked_student_id).filter(Boolean) || [];
    },
    enabled: !!user?.id,
  });

  const toggleLikeMutation = useMutation({
    mutationFn: async (studentId: string) => {
      if (!user?.id) throw new Error("User not authenticated");

      const isLiked = likedStudentIds.includes(studentId);

      if (isLiked) {
        const { error } = await supabase
          .from("student_likes")
          .delete()
          .eq("liker_id", user.id)
          .eq("liked_student_id", studentId);

        if (error) throw error;
        return { action: "unliked" as const, studentId };
      } else {
        const { error } = await supabase
          .from("student_likes")
          .insert({
            liker_id: user.id,
            liked_student_id: studentId,
          });

        if (error) throw error;
        return { action: "liked" as const, studentId };
      }
    },
    onSuccess: (result) => {
      queryClient.setQueryData(
        ["student-likes", user?.id],
        (oldData: string[] = []) => {
          if (result.action === "liked") {
            return [...oldData, result.studentId];
          } else {
            return oldData.filter((id) => id !== result.studentId);
          }
        }
      );
    },
  });

  const isLiked = (studentId: string) => likedStudentIds.includes(studentId);

  const toggleLike = (studentId: string) => {
    toggleLikeMutation.mutate(studentId);
  };

  return {
    likedStudentIds,
    isLoading,
    isLiked,
    toggleLike,
    isToggling: toggleLikeMutation.isPending,
  };
}; 