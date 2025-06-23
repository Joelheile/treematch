import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from './client'
import { Tables } from './types'

type Skill = Tables<'skills'>

export const useUpdateSkill = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string
      updates: Partial<Pick<Skill, 'name' | 'is_global'>>
    }): Promise<Skill> => {
      const { data, error } = await supabase
        .from('skills')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] })
    },
  })
} 