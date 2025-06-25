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
      
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', userId)
        .single()

      if (studentError) {
        if (studentError.code === 'PGRST116') {
          return { data: null, error: null }
        }
        throw studentError
      }

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

      if (skillsError) throw skillsError

      const skills = skillsData?.map(item => (item as any).skills).filter(Boolean) || []
      
      const studentWithSkills = {
        ...studentData,
        skills
      } as Student
      
      return { 
        data: studentWithSkills, 
        error: null 
      }
    },
    enabled: enabled && !!userId,
    retry: (failureCount, error: any) => {
      if (error?.code === 'PGRST116') {
        return failureCount < 2
      }
      return false
    },
    retryDelay: 1000,
  })
}