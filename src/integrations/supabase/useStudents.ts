import { useQuery } from '@tanstack/react-query'
import { supabase } from './client-ssr'
import { Tables } from './types'

export interface StudentWithSkills extends Tables<'students'> {
  skills: Tables<'skills'>[]
}



export interface StudentFilters {
  country?: string
  skillIds?: string[]
  hasLinkedIn?: boolean
  hasGithub?: boolean
  hasWebsite?: boolean
  search?: string
  isOnboarded?: boolean
  likedByUserId?: string
  hasEngr145Team?: boolean
}

export interface StudentSearchOptions {
  filters?: StudentFilters
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  totalCount: number
  hasMore: boolean
}

const sanitizeSearchTerm = (search: string): string => {
  return search
    .trim()
    .replace(/[<>]/g, '')
    .substring(0, 100)
}

const validateUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

export const useStudents = (options: StudentSearchOptions = {}) => {
  return useQuery({
    queryKey: ['students', options],
    queryFn: async (): Promise<PaginatedResponse<StudentWithSkills>> => {
      const { 
        filters = {},
        orderBy = 'created_at',
        orderDirection = 'desc'
      } = options

      let query = supabase
        .from('students')
        .select('*', { count: 'exact' })
        .order(orderBy, { ascending: orderDirection === 'asc' })

      if (filters.country) {
        const sanitizedCountry = filters.country.trim().substring(0, 100)
        query = query.eq('country', sanitizedCountry)
      }

      if (filters.isOnboarded !== undefined) {
        query = query.eq('isOnboarded', filters.isOnboarded)
      } else {
        query = query.eq('isOnboarded', true)
      }

      if (filters.hasLinkedIn !== undefined) {
        query = filters.hasLinkedIn 
          ? query.not('linkedin', 'is', null)
          : query.is('linkedin', null)
      }

      if (filters.hasGithub !== undefined) {
        query = filters.hasGithub 
          ? query.not('github', 'is', null)
          : query.is('github', null)
      }

      if (filters.hasWebsite !== undefined) {
        query = filters.hasWebsite 
          ? query.not('website', 'is', null)
          : query.is('website', null)
      }

      if (filters.hasEngr145Team !== undefined) {
        query = query.eq('has_engr145_team', filters.hasEngr145Team)
      }

      if (filters.search) {
        const sanitizedSearch = sanitizeSearchTerm(filters.search)
        query = query.or(`name.ilike.%${sanitizedSearch}%,email.ilike.%${sanitizedSearch}%,coolest_thing.ilike.%${sanitizedSearch}%`)
      }

      // Add skill filtering to main query if needed
      if (filters.skillIds && filters.skillIds.length > 0) {
        const validSkillIds = filters.skillIds.filter(validateUUID)
        if (validSkillIds.length > 0) {
          // Get student IDs that have the required skills
          const { data: studentIdsData } = await supabase
            .from('student_skills')
            .select('student_id')
            .in('skill_id', validSkillIds)
          
          const studentIds = studentIdsData?.map(item => item.student_id) || []
          if (studentIds.length > 0) {
            query = query.in('id', studentIds)
          } else {
            // No students found with these skills
            return {
              data: [],
              totalCount: 0,
              hasMore: false
            }
          }
        }
      }

      // Add liked filtering to main query if needed
      if (filters.likedByUserId && validateUUID(filters.likedByUserId)) {
        const { data: likedStudentsData } = await supabase
          .from('student_likes')
          .select('liked_student_id')
          .eq('liker_id', filters.likedByUserId)
        
        const likedStudentIds = likedStudentsData?.map(item => item.liked_student_id) || []
        if (likedStudentIds.length > 0) {
          query = query.in('id', likedStudentIds)
        } else {
          // No liked students found
          return {
            data: [],
            totalCount: 0,
            hasMore: false
          }
        }
      }

      // Single optimized query with JOIN for skills
      const { data: studentsData, error: studentsError, count } = await query
        .select(`
          *,
          student_skills!left(
            skills!inner(*)
          )
        `)

      if (studentsError) throw studentsError

      const studentsWithSkills: StudentWithSkills[] = (studentsData ?? []).map(
        ({ student_skills, ...student }) => ({
          ...student,
          skills: student_skills.flatMap((row) => (row.skills ? [row.skills] : [])),
        }),
      )

      return {
        data: studentsWithSkills,
        totalCount: count || 0,
        hasMore: false
      }
    },
  })
} 