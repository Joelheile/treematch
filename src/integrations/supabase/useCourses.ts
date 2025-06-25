import { useQuery } from '@tanstack/react-query'
import { supabase } from './client'
import { Tables } from './types'

type Course = Tables<'courses'>

export const useCourses = (userId?: string) => {
  return useQuery({
    queryKey: ['courses', userId],
    queryFn: async (): Promise<Course[]> => {
      let query = supabase
        .from('courses')
        .select('*')
        .order('name')

      if (userId) {
        query = query.or(`is_global.eq.true,user_id.eq.${userId}`)
      } else {
        query = query.eq('is_global', true)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    },
  })
}