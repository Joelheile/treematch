import { useQuery } from '@tanstack/react-query'
import { supabase } from './client-ssr'
import type { StudentWithSkills } from './useStudents'

export interface ServiceResponse<T> {
  data: T | null
  error: string | null
}

export const useStudentByUserId = (userId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['student-by-user-id', userId],
    queryFn: async (): Promise<ServiceResponse<StudentWithSkills>> => {
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (studentError) {
        console.error('Error fetching student by ID:', studentError)
        throw studentError
      }
      
      if (!studentData) {
        return { data: null, error: null }
      }

      const { data: skillRows, error: skillsError } = await supabase
        .from('student_skills')
        .select('skills(*)')
        .eq('student_id', studentData.id)

      if (skillsError) throw skillsError

      const skills = skillRows.flatMap((row) => (row.skills ? [row.skills] : []))

      return { data: { ...studentData, skills }, error: null }
    },
    enabled: enabled && !!userId,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}