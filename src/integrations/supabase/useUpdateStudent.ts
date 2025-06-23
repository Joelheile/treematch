import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from './client'
import { Tables, TablesUpdate } from './types'

type Student = Tables<'students'>
type StudentUpdate = TablesUpdate<'students'>

export const useUpdateStudent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string
      updates: StudentUpdate 
    }): Promise<Student> => {
      const { data, error } = await supabase
        .from('students')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
} 