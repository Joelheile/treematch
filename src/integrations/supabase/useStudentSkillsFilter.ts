import { useQuery } from '@tanstack/react-query'
import { createClient } from './client-ssr'

export interface SkillWithCount {
  id: string
  name: string
  student_count: number
}

// Get only skills that students actually have, with student counts
export const useStudentSkillsFilter = () => {
  return useQuery({
    queryKey: ['student-skills-filter'],
    queryFn: async (): Promise<SkillWithCount[]> => {
      const supabase = createClient()
      
      // Get skills that are actually used by students
      const { data, error } = await supabase
        .from('student_skills')
        .select(`
          skill_id,
          skills!inner(
            id,
            name,
            is_global
          )
        `)
        
      if (error) throw error
      
      // Group by skill and count students
      const skillCounts = data?.reduce((acc, item) => {
        const skill = item.skills
        if (skill && skill.is_global) {
          const existing = acc.find(s => s.id === skill.id)
          if (existing) {
            existing.student_count++
          } else {
            acc.push({
              id: skill.id,
              name: skill.name,
              student_count: 1
            })
          }
        }
        return acc
      }, [] as SkillWithCount[]) || []
      
      // Sort by student count (most popular first) then by name
      return skillCounts.sort((a, b) => {
        if (a.student_count !== b.student_count) {
          return b.student_count - a.student_count
        }
        return a.name.localeCompare(b.name)
      })
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}