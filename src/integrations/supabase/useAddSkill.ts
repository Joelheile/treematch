import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from './client-ssr'

export const useAddSkill = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      name, 
      is_global = false 
    }: { 
      name: string
      is_global?: boolean 
    }) => {
      const supabase = createClient()
      
      // Get current user for user_id
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('skills')
        .insert([{ 
          name, 
          is_global,
          user_id: is_global ? null : user?.id || null
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