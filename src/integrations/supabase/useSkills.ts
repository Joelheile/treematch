import { useQuery } from '@tanstack/react-query'
import { supabase } from './client-ssr'
import { Tables } from './types'

type Skill = Tables<'skills'>

export const useSkills = () => {
  return useQuery({
    queryKey: ['skills'],
    queryFn: async (): Promise<Skill[]> => {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('is_global', true)
        .order('name')

      if (error) throw error
      return data || []
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000,
  })
} 