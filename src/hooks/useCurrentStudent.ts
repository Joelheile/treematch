import { useAuth } from '@/app/auth/AuthProvider'
import { useStudentByUserId } from '@/integrations/supabase/useStudentByUserId'

export const useCurrentStudent = () => {
  const { user, loading: authLoading } = useAuth()
  
  const {
    data: studentResponse,
    isLoading,
    error,
    refetch
  } = useStudentByUserId(user?.id || '', !!user?.id && !authLoading)

  const student = studentResponse?.data
  const isOnboarded = student ? (student.isOnboarded === true) : false

  return {
    student,
    isOnboarded,
    isLoading: authLoading || (isLoading && !!user),
    error: user && !authLoading ? error : null,
    refetch
  }
} 