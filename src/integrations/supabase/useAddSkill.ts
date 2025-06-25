import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from './client-ssr'

export const useAddSkill = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      name, 
      isGlobal = true 
    }: { 
      name: string
      isGlobal?: boolean 
    }) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('skills')
        .insert([{ 
          name, 
          is_global: isGlobal
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