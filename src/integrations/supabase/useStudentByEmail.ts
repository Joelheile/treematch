import { useQuery } from '@tanstack/react-query'
import { supabase } from './client'
import { Tables } from './types'

type Student = Tables<'students'>
type Skill = Tables<'skills'>

export interface StudentWithSkills extends Student {
  skills: Skill[]
}

export interface ServiceResponse<T> {
  data: T | null
  error: string | null
}

export const useStudentByEmail = (email: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['student-by-email', email],
    queryFn: async (): Promise<ServiceResponse<StudentWithSkills>> => {
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('email', email)
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
            user_id,
            created_at
          )
        `)
        .eq('student_id', studentData.id)

      if (skillsError) throw skillsError

      const skills = skillsData?.map(item => (item as any).skills).filter(Boolean) || []
      
      const studentWithSkills = {
        ...studentData,
        skills
      } as StudentWithSkills
      
      return { 
        data: studentWithSkills, 
        error: null 
      }
    },
    enabled: enabled && !!email,
  })
} 