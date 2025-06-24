import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from './client'

export const useUpdateStudentCourses = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      studentId, 
      courseIds 
    }: { 
      studentId: string
      courseIds: string[] 
    }): Promise<void> => {
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