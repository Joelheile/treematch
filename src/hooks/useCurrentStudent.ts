import { useAuth } from '@/app/auth/AuthProvider'
import { useStudentByUserId } from '@/integrations/supabase/useStudentByUserId'

export const useCurrentStudent = () => {
  const { user } = useAuth()
  
  const {
    data: studentResponse,
    isLoading,
    error,
    refetch
  } = useStudentByUserId(user?.id || '', !!user?.id)

  const student = studentResponse?.data
  
  const isOnboarded = student ? (student.isOnboarded === true) : false

  return {
    student,
    isOnboarded,
    isLoading,
    error,
    refetch
  }
} 