import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/app/auth/AuthProvider'
import { supabase } from './client'

export const useUpdateStudentCourses = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ 
      studentId, 
      courseIds 
    }: { 
      studentId: string
      courseIds: string[] 
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
        throw new Error('Unauthorized: You can only update your own courses')
      }

      const { error: deleteError } = await supabase
        .from('student_courses')
        .delete()
        .eq('student_id', studentId)

      if (deleteError) throw deleteError

      if (courseIds.length > 0) {
        const studentCourses = courseIds.map(courseId => ({
          student_id: studentId,
          course_id: courseId,
          status: 'completed'
        }))

        const { error: insertError } = await supabase
          .from('student_courses')
          .insert(studentCourses)

        if (insertError) throw insertError
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student', variables.studentId] })
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}