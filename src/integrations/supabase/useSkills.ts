import { useQuery } from '@tanstack/react-query'
import { createClient } from './client-ssr'
import { Tables } from './types'

type Skill = Tables<'skills'>

export const useSkills = () => {
  return useQuery({
    queryKey: ['skills'],
    queryFn: async (): Promise<Skill[]> => {
      console.log('🔍 useSkills: Fetching skills...')
      const supabase = createClient()
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('is_global', true)
        .order('name')

      if (error) {
        console.error('❌ useSkills error:', error)
        throw error
      }
      
      console.log('✅ useSkills: Fetched skills:', data?.length || 0)
      return data || []
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000,
  })
} 