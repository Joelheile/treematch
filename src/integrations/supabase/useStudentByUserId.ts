import { useQuery } from '@tanstack/react-query'
import { supabase } from './client-ssr'
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
      console.log('🔍 useStudentByUserId: Fetching student for ID:', userId)
      
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', userId)
        .single()

      if (studentError) {
        if (studentError.code === 'PGRST116') {
          return { data: null, error: null }
        }
        console.error('Error fetching student data:', studentError)
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

      if (skillsError) {
        console.error('Error fetching student skills:', skillsError)
        // Don't throw error for skills - continue with student data
        const studentWithoutSkills = {
          ...studentData,
          skills: []
        } as Student
        
        return { 
          data: studentWithoutSkills, 
          error: skillsError.message 
        }
      }

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
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}