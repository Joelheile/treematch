import { useQuery } from '@tanstack/react-query'
import { supabase } from './client'
import { Tables } from './types'

type Skill = Tables<'skills'>

export const useSkills = (userId?: string) => {
  return useQuery({
    queryKey: ['skills', userId],
    queryFn: async (): Promise<Skill[]> => {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .or(`is_global.eq.true${userId ? `,user_id.eq.${userId}` : ''}`)
        .order('name')

      if (error) throw error
      return data || []
    },
  })
} 