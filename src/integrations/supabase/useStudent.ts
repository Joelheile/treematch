import { useQuery } from '@tanstack/react-query'
import { supabase } from './client'
import { Tables } from './types'

type Student = Tables<'students'>
type Skill = Tables<'skills'>

export interface StudentWithSkills extends Student {
  skills: Skill[]
}

export const useStudent = (id: string) => {
  return useQuery({
    queryKey: ['student', id],
    queryFn: async (): Promise<StudentWithSkills> => {
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single()

      if (studentError) throw studentError

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
        .eq('student_id', id)

      if (skillsError) throw skillsError

      const skills = skillsData?.map(item => (item as any).skills).filter(Boolean) || []
      
      return {
        ...studentData,
        skills
      } as StudentWithSkills
    },
    enabled: !!id,
  })
} 