import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/app/auth/AuthProvider'
import { supabase } from './client'
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
      if (!user?.email) {
        throw new Error('User not authenticated')
      }

      const { data: existingStudent, error: fetchError } = await supabase
        .from('students')
        .select('email')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      if (!existingStudent || existingStudent.email !== user.email) {
        throw new Error('Unauthorized: You can only update your own profile')
      }

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