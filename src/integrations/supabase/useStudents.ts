import { useQuery } from '@tanstack/react-query'
import { supabase } from './client'
import { StudentRow, StudentWithSkills } from '@/types/Student'

export type { StudentWithSkills } from '@/types/Student'

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

      const { data: studentsData, error: studentsError, count } = await query

      if (studentsError) throw studentsError

      let finalStudentsData = studentsData || []

      if (filters.skillIds && filters.skillIds.length > 0) {
        const validSkillIds = filters.skillIds.filter(validateUUID)
        if (validSkillIds.length > 0) {
          const { data: studentSkillsData, error: skillFilterError } = await supabase
            .from('student_skills')
            .select('student_id')
            .in('skill_id', validSkillIds)

          if (skillFilterError) throw skillFilterError

          const studentIdsWithSkills = studentSkillsData?.map(item => item.student_id) || []
          finalStudentsData = studentsData?.filter(student => 
            studentIdsWithSkills.includes(student.id)
          ) || []
        }
      }

      if (filters.likedByUserId) {
        if (validateUUID(filters.likedByUserId)) {
          const { data: likedStudentsData, error: likedFilterError } = await supabase
            .from('student_likes')
            .select('liked_student_id')
            .eq('liker_id', filters.likedByUserId)

          if (likedFilterError) throw likedFilterError

          const likedStudentIds = likedStudentsData?.map(item => item.liked_student_id) || []
          finalStudentsData = finalStudentsData.filter(student => 
            likedStudentIds.includes(student.id)
          )
        }
      }

      const studentIds = finalStudentsData.map(student => student.id)
      
      if (studentIds.length === 0) {
        return {
          data: [],
          totalCount: 0,
          hasMore: false
        }
      }

      const { data: allSkillsData, error: allSkillsError } = await supabase
        .from('student_skills')
        .select(`
          student_id,
          skills (
            id,
            name,
            is_global,
            user_id,
            created_at
          )
        `)
        .in('student_id', studentIds)

      if (allSkillsError) throw allSkillsError

      const skillsByStudent = allSkillsData?.reduce((acc, item) => {
        const studentId = item.student_id
        const skill = (item as any).skills
        if (!acc[studentId]) acc[studentId] = []
        if (skill) acc[studentId].push(skill)
        return acc
      }, {} as Record<string, StudentWithSkills['skills']>) || {}

      const studentsWithSkills = finalStudentsData.map(student => ({
        ...student,
        skills: skillsByStudent[student.id] || []
      })) as StudentWithSkills[]

      return {
        data: studentsWithSkills,
        totalCount: count || 0,
        hasMore: offset + limit < (count || 0)
      }
    },
  })
} 