import { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from './client'
import { Database, Tables, TablesInsert, TablesUpdate } from './types'

export type Student = Tables<'students'>
export type StudentInsert = TablesInsert<'students'>  
export type StudentUpdate = TablesUpdate<'students'>
export type StudentWithMetadata = Tables<'students_with_metadata'>
export type SkillRow = Tables<'skills'>
export type StudentSkillRow = Tables<'student_skills'>
export type StudentSkillInsert = TablesInsert<'student_skills'>

export interface ServiceResponse<T> {
  data: T | null
  error: string | null
  count?: number
}

export interface PaginatedResponse<T> extends ServiceResponse<T[]> {
  totalCount: number
  hasMore: boolean
  nextCursor?: string
}

export interface StudentFilters {
  country?: string
  skillIds?: string[]
  hasLinkedIn?: boolean
  hasGithub?: boolean 
  hasWebsite?: boolean
  hasSocialLinks?: boolean
  search?: string
}

export interface QueryOptions {
  limit?: number
  offset?: number
  orderBy?: keyof Student
  orderDirection?: 'asc' | 'desc'
  cursor?: string
}

export interface StudentSearchOptions extends QueryOptions {
  filters?: StudentFilters
}

export interface StudentWithSkills extends Student {
  skills: SkillRow[]
}

export class StudentService {
  private supabase: SupabaseClient<Database>

 

  async createStudent(student: StudentInsert): Promise<ServiceResponse<Student>> {
    try {
      const { data, error } = await supabase
        .from('students')
        .insert(student)
        .select()
        .single()

      if (error) {
        return { 
          data: null, 
          error: this.handleDatabaseError(error)
        }
      }

      return { data, error: null }
    } catch (err) {
      return { 
        data: null, 
        error: `Failed to create student: ${err instanceof Error ? err.message : 'Unknown error'}` 
      }
    }
  }

  async createStudentWithSkills(student: StudentInsert, skillIds: string[]): Promise<ServiceResponse<Student>> {
    try {
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .insert(student)
        .select()
        .single()

      if (studentError) {
        return { 
          data: null, 
          error: this.handleDatabaseError(studentError)
        }
      }

      if (skillIds.length > 0) {
        const studentSkills = skillIds.map(skillId => ({
          student_id: studentData.id,
          skill_id: skillId
        }))

        const { error: skillsError } = await supabase
          .from('student_skills')
          .insert(studentSkills)

        if (skillsError) {
          // Rollback student creation if skills insertion fails
          await supabase.from('students').delete().eq('id', studentData.id)
          return { 
            data: null, 
            error: this.handleDatabaseError(skillsError)
          }
        }
      }

      return { data: studentData, error: null }
    } catch (err) {
      return { 
        data: null, 
        error: `Failed to create student with skills: ${err instanceof Error ? err.message : 'Unknown error'}` 
      }
    }
  }

  async getStudentById(id: string): Promise<ServiceResponse<StudentWithSkills>> {
    try {
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single()

      if (studentError) {
        return { 
          data: null, 
          error: this.handleDatabaseError(studentError)
        }
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
        .eq('student_id', id)

      if (skillsError) {
        return { 
          data: null, 
          error: this.handleDatabaseError(skillsError)
        }
      }

      const skills = skillsData?.map(item => (item as any).skills).filter(Boolean) || []
      const studentWithSkills: StudentWithSkills = {
        ...studentData,
        skills
      }

      return { data: studentWithSkills, error: null }
    } catch (err) {
      return { 
        data: null, 
        error: `Failed to fetch student: ${err instanceof Error ? err.message : 'Unknown error'}` 
      }
    }
  }

  async updateStudentSkills(studentId: string, skillIds: string[]): Promise<ServiceResponse<boolean>> {
    try {
      // Delete existing skills
      const { error: deleteError } = await supabase
        .from('student_skills')
        .delete()
        .eq('student_id', studentId)

      if (deleteError) {
        return { 
          data: null, 
          error: this.handleDatabaseError(deleteError)
        }
      }

      // Insert new skills
      if (skillIds.length > 0) {
        const studentSkills = skillIds.map(skillId => ({
          student_id: studentId,
          skill_id: skillId
        }))

        const { error: insertError } = await supabase
          .from('student_skills')
          .insert(studentSkills)

        if (insertError) {
          return { 
            data: null, 
            error: this.handleDatabaseError(insertError)
          }
        }
      }

      return { data: true, error: null }
    } catch (err) {
      return { 
        data: null, 
        error: `Failed to update student skills: ${err instanceof Error ? err.message : 'Unknown error'}` 
      }
    }
  }

  async searchStudents(options: StudentSearchOptions = {}): Promise<PaginatedResponse<StudentWithSkills>> {
    try {
      const { filters = {}, limit = 20, offset = 0, orderBy = 'created_at', orderDirection = 'desc' } = options

      let query = supabase
        .from('students')
        .select('*', { count: 'exact' })
        .order(orderBy, { ascending: orderDirection === 'asc' })
        .range(offset, offset + limit - 1)

      query = this.applyFilters(query, filters)

      const { data: studentsData, error: studentsError, count } = await query

      if (studentsError) {
        return { 
          data: null, 
          error: this.handleDatabaseError(studentsError),
          totalCount: 0,
          hasMore: false
        }
      }

      // Fetch skills for all students
      const studentIds = studentsData?.map(student => student.id) || []
      let studentsWithSkills: StudentWithSkills[] = []

      if (studentIds.length > 0) {
        const { data: skillsData, error: skillsError } = await supabase
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

        if (skillsError) {
          return { 
            data: null, 
            error: this.handleDatabaseError(skillsError),
            totalCount: 0,
            hasMore: false
          }
        }

        // Group skills by student
        const skillsByStudent = skillsData?.reduce((acc, item) => {
          const studentId = item.student_id
          const skill = (item as any).skills
          if (!acc[studentId]) acc[studentId] = []
          if (skill) acc[studentId].push(skill)
          return acc
        }, {} as Record<string, SkillRow[]>) || {}

        studentsWithSkills = studentsData?.map(student => ({
          ...student,
          skills: skillsByStudent[student.id] || []
        })) || []
      }

      const totalCount = count || 0
      const hasMore = offset + limit < totalCount

      return { 
        data: studentsWithSkills, 
        error: null, 
        totalCount,
        hasMore
      }
    } catch (err) {
      return { 
        data: null, 
        error: `Failed to search students: ${err instanceof Error ? err.message : 'Unknown error'}`,
        totalCount: 0,
        hasMore: false
      }
    }
  }

  async getStudentsBySkillIds(skillIds: string[], options: QueryOptions = {}): Promise<PaginatedResponse<StudentWithSkills>> {
    try {
      const { limit = 20, offset = 0 } = options

      const { data: studentSkillsData, error: skillsError, count } = await supabase
        .from('student_skills')
        .select(`
          student_id,
          students (*)
        `, { count: 'exact' })
        .in('skill_id', skillIds)
        .range(offset, offset + limit - 1)

      if (skillsError) {
        return { 
          data: null, 
          error: this.handleDatabaseError(skillsError),
          totalCount: 0,
          hasMore: false
        }
      }

      const students = studentSkillsData?.map(item => (item as any).students).filter(Boolean) || []
      const studentIds = students.map(student => student.id)

      // Get all skills for these students
      let studentsWithSkills: StudentWithSkills[] = []
      
      if (studentIds.length > 0) {
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

        if (allSkillsError) {
          return { 
            data: null, 
            error: this.handleDatabaseError(allSkillsError),
            totalCount: 0,
            hasMore: false
          }
        }

        const skillsByStudent = allSkillsData?.reduce((acc, item) => {
          const studentId = item.student_id
          const skill = (item as any).skills
          if (!acc[studentId]) acc[studentId] = []
          if (skill) acc[studentId].push(skill)
          return acc
        }, {} as Record<string, SkillRow[]>) || {}

        studentsWithSkills = students.map(student => ({
          ...student,
          skills: skillsByStudent[student.id] || []
        }))
      }

      const totalCount = count || 0
      const hasMore = offset + limit < totalCount

      return { 
        data: studentsWithSkills, 
        error: null, 
        totalCount,
        hasMore
      }
    } catch (err) {
      return { 
        data: null, 
        error: `Failed to fetch students by skills: ${err instanceof Error ? err.message : 'Unknown error'}`,
        totalCount: 0,
        hasMore: false
      }
    }
  }

  async getSkills(userId?: string): Promise<SkillRow[]> {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .or(`is_global.eq.true,user_id.eq.${userId || ''}`)
      .order('name')

    if (error) return []
    return data || []
  }

  async addSkill(name: string, userId: string): Promise<ServiceResponse<SkillRow>> {
    try {
      const { data, error } = await supabase
        .from('skills')
        .insert([{ name, is_global: false, user_id: userId }])
        .select()
        .single()

      if (error) {
        return { 
          data: null, 
          error: this.handleDatabaseError(error)
        }
      }

      return { data, error: null }
    } catch (err) {
      return { 
        data: null, 
        error: `Failed to add skill: ${err instanceof Error ? err.message : 'Unknown error'}` 
      }
    }
  }

  private applyFilters(query: any, filters: StudentFilters) {
    if (filters.country) {
      query = query.eq('country', filters.country)
    }

    if (filters.skillIds && filters.skillIds.length > 0) {
      // For skill filtering with many-to-many, we need to join with student_skills
      // This is more complex and would require a different query structure
      // For now, we'll handle this in the searchStudents method differently
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
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,current_project.ilike.%${filters.search}%`)
    }

    return query
  }

  private handleDatabaseError(error: any): string {
    switch (error.code) {
      case '23505':
        if (error.details.includes('email')) {
          return 'A student with this email already exists'
        }
        return 'This record already exists'
      case '23503':
        return 'Invalid reference to related data'
      case '23514':
        return 'Data validation failed'
      case 'PGRST116':
        return 'Student not found'
      case 'PGRST301':
        return 'Access denied'
      default:
        return error.message || 'Database operation failed'
    }
  }
}




export const studentService = new StudentService()

export const useStudentService = () => {
  return studentService
} 