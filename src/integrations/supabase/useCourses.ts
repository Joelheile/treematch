import { useQuery } from '@tanstack/react-query'
import { supabase } from './client'
import { Tables } from './types'

type Course = Tables<'courses'>

export const useCourses = (userId?: string) => {
  return useQuery({
    queryKey: ['courses', userId],
    queryFn: async (): Promise<Course[]> => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .or(`is_global.eq.true${userId ? `,user_id.eq.${userId}` : ''}`)
        .order('name')

      if (error) throw error
      return data || []
    },
  })
}