import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/app/auth/AuthProvider'
import { createClient } from './client-ssr'
import { Tables, TablesUpdate } from './types'

type Student = Tables<'students'>
type StudentUpdate = TablesUpdate<'students'>

export const useUpdateStudent = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string
      updates: StudentUpdate 
    }): Promise<Student> => {
      const supabase = createClient()

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
      queryClient.invalidateQueries({ queryKey: ['student-by-user-id', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['student', variables.id] })
    },
  })
} 