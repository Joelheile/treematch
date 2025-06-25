import { useQuery } from '@tanstack/react-query'
import { createClient } from './client-ssr'
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
}

export interface StudentSearchOptions {
  limit?: number
  offset?: number
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
        limit = 20, 
        offset = 0, 
        filters = {},
        orderBy = 'created_at',
        orderDirection = 'desc'
      } = options

      const supabase = createClient()
      let query = supabase
        .from('students')
        .select('*', { count: 'exact' })
        .order(orderBy, { ascending: orderDirection === 'asc' })
        .range(offset, offset + limit - 1)

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

      if (filters.search) {
        const sanitizedSearch = sanitizeSearchTerm(filters.search)
        query = query.or(`name.ilike.%${sanitizedSearch}%,email.ilike.%${sanitizedSearch}%,current_project.ilike.%${sanitizedSearch}%`)
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
            skills!inner(
              id,
              name,
              is_global,
              created_at
            )
          )
        `)

      if (studentsError) throw studentsError

      // Transform the data to match expected format
      const studentsWithSkills = (studentsData || []).map(student => {
        const skills = (student as any).student_skills
          ?.map((ss: any) => ss.skills)
          ?.filter((skill: any) => skill) || []
        
        const { student_skills, ...cleanStudent } = student as any
        return {
          ...cleanStudent,
          skills
        }
      }) as StudentWithSkills[]

      return {
        data: studentsWithSkills,
        totalCount: count || 0,
        hasMore: offset + limit < (count || 0)
      }
    },
  })
} 