import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/app/auth/AuthProvider'
import { supabase } from './client'

export const useUpdateStudentSkills = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ 
      studentId, 
      skillIds 
    }: { 
      studentId: string
      skillIds: string[] 
    }): Promise<void> => {
      if (!user?.email) {
        throw new Error('User not authenticated')
      }

      const { data: existingStudent, error: fetchError } = await supabase
        .from('students')
        .select('email')
        .eq('id', studentId)
        .single()

      if (fetchError) throw fetchError

      if (!existingStudent || existingStudent.email !== user.email) {
        throw new Error('Unauthorized: You can only update your own skills')
      }

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