import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from './client'

export const useAddSkill = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      name, 
      userId,
      isGlobal = false 
    }: { 
      name: string
      userId: string
      isGlobal?: boolean 
    }) => {
      const { data, error } = await supabase
        .from('skills')
        .insert([{ 
          name, 
          is_global: isGlobal, 
          user_id: isGlobal ? null : userId 
        }])
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