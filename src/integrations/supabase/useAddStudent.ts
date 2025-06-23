import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from './client'
import { TablesInsert } from './types'

type StudentInsert = TablesInsert<'students'>

export const useAddStudent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      student, 
      skillIds = [] 
    }: { 
      student: StudentInsert
      skillIds?: string[] 
    }) => {
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .insert(student)
        .select()
        .single()

      if (studentError) throw studentError

      if (skillIds.length > 0) {
        const studentSkills = skillIds.map(skillId => ({
          student_id: studentData.id,
          skill_id: skillId
        }))

        const { error: skillsError } = await supabase
          .from('student_skills')
          .insert(studentSkills)

        if (skillsError) {
          await supabase.from('students').delete().eq('id', studentData.id)
          throw skillsError
        }
      }

      return studentData
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
} 