import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from './client'

export const useUpdateStudentSkills = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      studentId, 
      skillIds 
    }: { 
      studentId: string
      skillIds: string[] 
    }): Promise<void> => {
      const { error: deleteError } = await supabase
        .from('student_skills')
        .delete()
        .eq('student_id', studentId)

      if (deleteError) throw deleteError

      if (skillIds.length > 0) {
        const studentSkills = skillIds.map(skillId => ({
          student_id: studentId,
          skill_id: skillId
        }))

        const { error: insertError } = await supabase
          .from('student_skills')
          .insert(studentSkills)

        if (insertError) throw insertError
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student', variables.studentId] })
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
} 