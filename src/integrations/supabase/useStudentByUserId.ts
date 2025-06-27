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
      console.log('🔍 Fetching student data for userId:', userId)
      
      const supabase = createClient()
      
      // First attempt: direct lookup by user ID
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (studentError && studentError.code !== 'PGRST116') {
        console.error('❌ Error fetching student by ID:', studentError)
        throw studentError
      }
      
      if (studentData) {
        console.log('✅ Found student by ID:', studentData.email)
        
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
          console.error('⚠️ Error fetching student skills:', skillsError)
          // Don't throw error for skills - continue with student data
        }

        const skills = skillsData?.map(item => (item as any).skills).filter(Boolean) || []
        
        return { 
          data: { ...studentData, skills } as Student, 
          error: null 
        }
      }

      // Second attempt: fallback to email lookup if user ID not found
      console.log('🔄 Student not found by ID, trying email fallback...')
      
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user?.email) {
          console.log('❌ No authenticated user found for email fallback')
          return { data: null, error: null }
        }
        
        const { data: studentByEmail, error: emailError } = await supabase
          .from('students')
          .select('*')
          .eq('email', user.email)
          .maybeSingle()
        
        if (emailError && emailError.code !== 'PGRST116') {
          console.error('❌ Error in email fallback lookup:', emailError)
          throw emailError
        }
        
        if (studentByEmail) {
          console.log('✅ Found student by email fallback:', studentByEmail.email)
          
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
            .eq('student_id', studentByEmail.id)
          
          const skills = skillsData?.map(item => (item as any).skills).filter(Boolean) || []
          
          return { 
            data: { ...studentByEmail, skills } as Student, 
            error: null 
          }
        }
        
        console.log('📝 No student found by ID or email - user needs onboarding')
        return { data: null, error: null }
      } catch (fallbackError) {
        console.error('💥 Error in email fallback lookup:', fallbackError)
        return { data: null, error: null }
      }
    },
    enabled: enabled && !!userId,
    retry: (failureCount, error: any) => {
      // Don't retry for "not found" errors
      if (error?.code === 'PGRST116') {
        return false
      }
      // Retry other errors up to 2 times
      return failureCount < 2
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}