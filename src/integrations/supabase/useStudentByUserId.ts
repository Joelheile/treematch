import { useQuery } from '@tanstack/react-query'
import { createClient } from './client-ssr'
import { Tables } from './types'

type Student = Tables<'students'>

export interface ServiceResponse<T> {
  data: T | null
  error: string | null
}

export const useStudentByUserId = (userId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['student-by-user-id', userId],
    queryFn: async (): Promise<ServiceResponse<Student>> => {
      const supabase = createClient()
      
      // Fetch student data by ID
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

      // Fetch skills for this student
      const { data: skillsData, error: skillsError } = await supabase
        .from('student_skills')
        .select(`
          skills (
            id,
            name,
            is_global,
            created_at
          )
        `)
        .eq('student_id', studentData.id)

      if (skillsError) {
        console.warn('Error fetching student skills:', skillsError)
        // Continue without skills if there's an error
      }

      const skills = skillsData?.map(item => (item as any).skills).filter(Boolean) || []
      
      return { 
        data: { ...studentData, skills } as Student, 
        error: null 
      }
    },
    enabled: enabled && !!userId,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}