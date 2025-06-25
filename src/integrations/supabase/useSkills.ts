import { useQuery } from '@tanstack/react-query'
import { supabase } from './client'
import { Tables } from './types'

type Skill = Tables<'skills'>

export const useSkills = (userId?: string) => {
  return useQuery({
    queryKey: ['skills', userId],
    queryFn: async (): Promise<Skill[]> => {
      let query = supabase
        .from('skills')
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