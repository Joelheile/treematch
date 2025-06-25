import { useQuery } from '@tanstack/react-query'
import { createClient } from './client-ssr'
import { Tables } from './types'

type Skill = Tables<'skills'>

export const useSkills = () => {
  return useQuery({
    queryKey: ['skills'],
    queryFn: async (): Promise<Skill[]> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('is_global', true)
        .order('name')

      if (error) throw error
      return data || []
    },
  })
} 