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
      // TODO: Course schema needs to be updated to include name, code, department fields
      const { data, error } = await supabase
        .from('courses')
        .insert([{ 
          id: crypto.randomUUID()
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