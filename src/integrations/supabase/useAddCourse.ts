import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from './client'

export const useAddCourse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      name, 
      code,
      department,
      userId,
      isGlobal = true 
    }: { 
      name: string
      code?: string
      department?: string
      userId: string
      isGlobal?: boolean 
    }) => {
      const { data, error } = await supabase
        .from('courses')
        .insert([{ 
          name, 
          code,
          department,
          is_global: isGlobal, 
          user_id: isGlobal ? null : userId 
        }])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    },
  })
}