import { useAuth } from '@/app/auth/AuthProvider'
import { useStudentByEmail } from '@/integrations/supabase/useStudentByEmail'

export const useCurrentStudent = () => {
  const { user } = useAuth()
  
  const {
    data: studentResponse,
    isLoading,
    error,
    refetch
  } = useStudentByEmail(user?.email || '', !!user?.email)

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