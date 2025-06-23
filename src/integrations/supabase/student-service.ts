import { supabase as defaultSupabase } from '@/integrations/supabase/client'
import { createClient } from '@/integrations/supabase/client-ssr'
import type { Database, Tables, TablesInsert, TablesUpdate } from './types'
import type { SupabaseClient } from '@supabase/supabase-js'

export type Student = Tables<'students'>
export type StudentInsert = TablesInsert<'students'>  
export type StudentUpdate = TablesUpdate<'students'>
export type StudentWithMetadata = Tables<'students_with_metadata'>

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
  skills?: string[]
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

export class StudentService {
  private supabase: SupabaseClient<Database>

  constructor(supabase?: SupabaseClient<Database>) {
    this.supabase = supabase || defaultSupabase
  }
  async createStudent(student: StudentInsert): Promise<ServiceResponse<Student>> {
    try {
      if (!student.email) {
        return { data: null, error: 'Email is required' }
      }

      const { data, error } = await this.supabase
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

  async getStudentById(id: string): Promise<ServiceResponse<Student>> {
    try {
      const { data, error } = await this.supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        return { 
          data: null, 
          error: error.code === 'PGRST116' ? 'Student not found' : this.handleDatabaseError(error)
        }
      }

      return { data, error: null }
    } catch (err) {
      return { 
        data: null, 
        error: `Failed to fetch student: ${err instanceof Error ? err.message : 'Unknown error'}` 
      }
    }
  }

  async getStudentByEmail(email: string): Promise<ServiceResponse<Student>> {
    try {
      const { data, error } = await this.supabase
        .from('students')
        .select('*')
        .eq('email', email)
        .single()

      if (error) {
        return { 
          data: null, 
          error: error.code === 'PGRST116' ? 'Student not found' : this.handleDatabaseError(error)
        }
      }

      return { data, error: null }
    } catch (err) {
      return { 
        data: null, 
        error: `Failed to fetch student: ${err instanceof Error ? err.message : 'Unknown error'}` 
      }
    }
  }

  async updateStudent(id: string, updates: StudentUpdate): Promise<ServiceResponse<Student>> {
    try {
      const { data, error } = await this.supabase
        .from('students')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return { 
          data: null, 
          error: error.code === 'PGRST116' ? 'Student not found' : this.handleDatabaseError(error)
        }
      }

      return { data, error: null }
    } catch (err) {
      return { 
        data: null, 
        error: `Failed to update student: ${err instanceof Error ? err.message : 'Unknown error'}` 
      }
    }
  }

  async deleteStudent(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await this.supabase
        .from('students')
        .delete()
        .eq('id', id)

      if (error) {
        return { 
          data: null, 
          error: this.handleDatabaseError(error)
        }
      }

      return { data: true, error: null }
    } catch (err) {
      return { 
        data: null, 
        error: `Failed to delete student: ${err instanceof Error ? err.message : 'Unknown error'}` 
      }
    }
  }

  async searchStudents(options: StudentSearchOptions = {}): Promise<PaginatedResponse<Student>> {
    try {
      const { 
        limit = 20, 
        offset = 0, 
        orderBy = 'created_at', 
        orderDirection = 'desc',
        filters = {} 
      } = options

      let query = this.supabase
        .from('students')
        .select('*', { count: 'exact' })

      query = this.applyFilters(query, filters)

      query = query.order(orderBy, { ascending: orderDirection === 'asc' })

      const { data, error, count } = await query
        .range(offset, offset + limit - 1)

      if (error) {
        return { 
          data: null, 
          error: this.handleDatabaseError(error),
          totalCount: 0,
          hasMore: false
        }
      }

      const totalCount = count || 0
      const hasMore = offset + limit < totalCount

      return { 
        data, 
        error: null, 
        totalCount,
        hasMore,
        nextCursor: hasMore ? (offset + limit).toString() : undefined
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

  async getStudentsWithMetadata(options: QueryOptions = {}): Promise<PaginatedResponse<StudentWithMetadata>> {
    try {
      const { 
        limit = 20, 
        offset = 0, 
        orderBy = 'created_at', 
        orderDirection = 'desc'
      } = options

      const { data, error, count } = await this.supabase
        .from('students_with_metadata')
        .select('*', { count: 'exact' })
        .order(orderBy, { ascending: orderDirection === 'asc' })
        .range(offset, offset + limit - 1)

      if (error) {
        return { 
          data: null, 
          error: this.handleDatabaseError(error),
          totalCount: 0,
          hasMore: false
        }
      }

      const totalCount = count || 0
      const hasMore = offset + limit < totalCount

      return { 
        data, 
        error: null, 
        totalCount,
        hasMore
      }
    } catch (err) {
      return { 
        data: null, 
        error: `Failed to fetch students with metadata: ${err instanceof Error ? err.message : 'Unknown error'}`,
        totalCount: 0,
        hasMore: false
      }
    }
  }

  async getStudentsBySkill(skill: string, options: QueryOptions = {}): Promise<PaginatedResponse<Student>> {
    try {
      const { limit = 20, offset = 0 } = options

      const { data, error, count } = await this.supabase
        .from('students')
        .select('*', { count: 'exact' })
        .contains('skills', [skill])
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        return { 
          data: null, 
          error: this.handleDatabaseError(error),
          totalCount: 0,
          hasMore: false
        }
      }

      const totalCount = count || 0
      const hasMore = offset + limit < totalCount

      return { 
        data, 
        error: null, 
        totalCount,
        hasMore
      }
    } catch (err) {
      return { 
        data: null, 
        error: `Failed to fetch students by skill: ${err instanceof Error ? err.message : 'Unknown error'}`,
        totalCount: 0,
        hasMore: false
      }
    }
  }

  async getStudentsByCountry(country: string, options: QueryOptions = {}): Promise<PaginatedResponse<Student>> {
    try {
      const { limit = 20, offset = 0 } = options

      const { data, error, count } = await this.supabase
        .from('students')
        .select('*', { count: 'exact' })
        .eq('country', country)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        return { 
          data: null, 
          error: this.handleDatabaseError(error),
          totalCount: 0,
          hasMore: false
        }
      }

      const totalCount = count || 0
      const hasMore = offset + limit < totalCount

      return { 
        data, 
        error: null, 
        totalCount,
        hasMore
      }
    } catch (err) {
      return { 
        data: null, 
        error: `Failed to fetch students by country: ${err instanceof Error ? err.message : 'Unknown error'}`,
        totalCount: 0,
        hasMore: false
      }
    }
  }

  async createMultipleStudents(students: StudentInsert[]): Promise<ServiceResponse<Student[]>> {
    try {
      const { data, error } = await this.supabase
        .from('students')
        .insert(students)
        .select()

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
        error: `Failed to create multiple students: ${err instanceof Error ? err.message : 'Unknown error'}` 
      }
    }
  }

  async getStudentAnalytics(): Promise<ServiceResponse<{
    totalStudents: number
    studentsByCountry: { [country: string]: number }
    topSkills: { skill: string; count: number }[]
    studentsWithSocialLinks: number
  }>> {
    try {
      const { count: totalStudents, error: countError } = await this.supabase
        .from('students')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        throw countError
      }

      const { data: countryData, error: countryError } = await this.supabase
        .from('students')
        .select('country')
        .not('country', 'is', null)

      if (countryError) {
        throw countryError
      }

      const { count: studentsWithSocialLinks, error: socialError } = await this.supabase
        .from('students_with_metadata')
        .select('*', { count: 'exact', head: true })
        .eq('has_social_links', true)

      if (socialError) {
        throw socialError
      }

      const studentsByCountry = countryData.reduce((acc, student) => {
        const country = student.country || 'Unknown'
        acc[country] = (acc[country] || 0) + 1
        return acc
      }, {} as { [country: string]: number })

      const { data: skillsData, error: skillsError } = await this.supabase
        .from('students')
        .select('skills')
        .not('skills', 'is', null)

      if (skillsError) {
        throw skillsError
      }

      const skillCounts: { [skill: string]: number } = {}
      skillsData.forEach(student => {
        student.skills?.forEach(skill => {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1
        })
      })

      const topSkills = Object.entries(skillCounts)
        .map(([skill, count]) => ({ skill, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      return {
        data: {
          totalStudents: totalStudents || 0,
          studentsByCountry,
          topSkills,
          studentsWithSocialLinks: studentsWithSocialLinks || 0
        },
        error: null
      }
    } catch (err) {
      return { 
        data: null, 
        error: `Failed to fetch analytics: ${err instanceof Error ? err.message : 'Unknown error'}` 
      }
    }
  }

  subscribeToStudents(
    callback: (payload: any) => void,
    filters?: { event?: 'INSERT' | 'UPDATE' | 'DELETE'; filter?: string }
  ) {
    const subscription = this.supabase
      .channel('students_changes')
      .on('postgres_changes', {
        event: filters?.event || '*',
        schema: 'public',
        table: 'students',
        filter: filters?.filter
      } as any, callback)

    return subscription.subscribe()
  }

  private applyFilters(query: any, filters: StudentFilters) {
    if (filters.country) {
      query = query.eq('country', filters.country)
    }

    if (filters.skills && filters.skills.length > 0) {
      query = query.overlaps('skills', filters.skills)
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
      case '23505': // Unique violation
        if (error.details.includes('email')) {
          return 'A student with this email already exists'
        }
        return 'This record already exists'
      case '23503': // Foreign key violation
        return 'Invalid reference to related data'
      case '23514': // Check constraint violation
        return 'Data validation failed'
      case 'PGRST116': // Not found
        return 'Student not found'
      case 'PGRST301': // Row Level Security violation
        return 'Access denied'
      default:
        return error.message || 'Database operation failed'
    }
  }
}

export const createStudentService = (supabase?: SupabaseClient<Database>) => {
  return new StudentService(supabase)
}

// Server-side student service should be created separately in server components
// to avoid importing next/headers in client components

export const studentService = new StudentService()

export const useStudentService = () => {
  return studentService
} 