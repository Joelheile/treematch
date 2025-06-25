import { useQuery } from '@tanstack/react-query'
import { supabase } from './client'
import { Tables } from './types'

type Course = Tables<'courses'>

export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async (): Promise<Course[]> => {
      // Since courses table doesn't exist yet, return empty array
      // This can be implemented when courses functionality is needed
      return []
    },
  })
}