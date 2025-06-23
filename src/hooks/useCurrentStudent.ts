import { useAuth } from '@/app/auth/AuthProvider'
import { useStudentByEmail } from '@/integrations/supabase/student-queries'

export const useCurrentStudent = () => {
  const { user } = useAuth()
  
  const {
    data: studentResponse,
    isLoading,
    error,
    refetch
  } = useStudentByEmail(user?.email || '', !!user?.email)

  const student = studentResponse?.data
  const isOnboarded = student?.isOnboarded || false

  return {
    student,
    isOnboarded,
    isLoading,
    error,
    refetch
  }
} 