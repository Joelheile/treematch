import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './client-ssr';

export interface StudentSkill {
  id: string;
  skill_id: string;
  student_id: string;
  skill: {
    id: string;
    name: string;
  };
}

// Get student's skills
export const useStudentSkills = (studentId?: string) => {
  return useQuery({
    queryKey: ['student-skills', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      
      const { data, error } = await supabase
        .from('student_skills')
        .select(`
          id,
          skill_id,
          student_id,
          skill:skills(id, name)
        `)
        .eq('student_id', studentId);

      if (error) throw error;
      return data as StudentSkill[];
    },
    enabled: !!studentId,
  });
};

// Update student's skills (replace all)
export const useUpdateStudentSkills = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ studentId, skillIds }: { studentId: string; skillIds: string[] }) => {
      // Delete existing skills
      const { error: deleteError } = await supabase
        .from('student_skills')
        .delete()
        .eq('student_id', studentId);

      if (deleteError) throw deleteError;

      // Insert new skills
      if (skillIds.length > 0) {
        const { error } = await supabase
          .from('student_skills')
          .insert(
            skillIds.map(skillId => ({
              student_id: studentId,
              skill_id: skillId,
            }))
          );

        if (error) throw error;
      }

      return { studentId, skillIds };
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['student-skills', data.studentId] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};