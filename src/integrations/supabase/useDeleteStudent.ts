import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/app/auth/AuthProvider'
import { supabase } from './client-ssr'

export const useDeleteStudent = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
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
        throw new Error('Unauthorized: You can only delete your own profile')
      }

      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
} 