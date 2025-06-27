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
      
      // Wait a moment to ensure auth context is established
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Try direct ID lookup first (most common case)
      try {
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('id', userId)
          .maybeSingle()

        if (studentError) {
          console.error('❌ Error fetching by ID:', studentError)
        }
        
        if (studentData) {
          console.log('✅ Found student by ID:', studentData.email)
          
          // Fetch skills separately to avoid complex joins
          try {
            const { data: skillsData } = await supabase
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

            const skills = skillsData?.map(item => (item as any).skills).filter(Boolean) || []
            
            return { 
              data: { ...studentData, skills } as Student, 
              error: null 
            }
          } catch (skillsError) {
            console.warn('⚠️ Error fetching skills, continuing without:', skillsError)
            return { 
              data: { ...studentData, skills: [] } as Student, 
              error: null 
            }
          }
        }
      } catch (directFetchError) {
        console.error('💥 Direct fetch failed:', directFetchError)
      }

      // Fallback: try email lookup
      console.log('🔄 Trying email fallback...')
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user?.email) {
          console.log('❌ No user context for email fallback')
          return { data: null, error: 'No authentication context' }
        }
        
        const { data: studentByEmail, error: emailError } = await supabase
          .from('students')
          .select('*')
          .eq('email', user.email)
          .maybeSingle()
        
        if (emailError) {
          console.error('❌ Email fallback error:', emailError)
        }
        
        if (studentByEmail) {
          console.log('✅ Found student by email:', studentByEmail.email)
          
          try {
            const { data: skillsData } = await supabase
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
          } catch (skillsError) {
            console.warn('⚠️ Error fetching skills for email fallback:', skillsError)
            return { 
              data: { ...studentByEmail, skills: [] } as Student, 
              error: null 
            }
          }
        }
        
        console.log('📝 No student found - user needs onboarding')
        return { data: null, error: null }
        
      } catch (fallbackError) {
        console.error('💥 Email fallback failed:', fallbackError)
        return { data: null, error: 'Failed to fetch student data' }
      }
    },
    enabled: enabled && !!userId,
    retry: (failureCount, error: any) => {
      // Retry network errors but not auth errors
      if (error?.message?.includes('authentication') || error?.message?.includes('auth')) {
        return false
      }
      return failureCount < 2
    },
    retryDelay: (attemptIndex) => Math.min(500 * 2 ** attemptIndex, 3000),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    networkMode: 'online',
  })
}