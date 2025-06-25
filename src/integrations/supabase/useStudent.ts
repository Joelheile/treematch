import { useQuery } from '@tanstack/react-query'
import { createClient } from './client-ssr'
import { StudentWithSkills } from '@/types/Student'

export type { StudentWithSkills } from '@/types/Student'

export const useStudent = (id: string) => {
  return useQuery({
    queryKey: ['student', id],
    queryFn: async (): Promise<StudentWithSkills> => {
      const supabase = createClient()
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