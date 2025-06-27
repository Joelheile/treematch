import { useAuth } from '@/app/auth/AuthProvider'
import { useStudentByUserId } from '@/integrations/supabase/useStudentByUserId'
import { useEffect, useState } from 'react'

export const useCurrentStudent = () => {
  const { user, loading: authLoading } = useAuth()
  const [forcedNotLoading, setForcedNotLoading] = useState(false)
  
  const {
    data: studentResponse,
    isLoading,
    error,
    refetch
  } = useStudentByUserId(user?.id || '', !!user?.id && !authLoading)

  const student = studentResponse?.data
  const isOnboarded = student ? (student.isOnboarded === true) : false

  // Reduced timeout to 8 seconds to coordinate with AuthProvider's 5s timeout
  useEffect(() => {
    if (isLoading && user?.id && !authLoading) {
      const timeout = setTimeout(() => {
        console.warn('⏰ useCurrentStudent: Force setting loading to false after 8s timeout')
        setForcedNotLoading(true)
      }, 8000)
      
      return () => clearTimeout(timeout)
    }
  }, [isLoading, user?.id, authLoading])

  // Reset forced state when loading changes
  useEffect(() => {
    if (!isLoading) {
      setForcedNotLoading(false)
    }
  }, [isLoading])

  // Don't show as loading if auth is still loading
  const actuallyLoading = isLoading && !forcedNotLoading && !authLoading

  return {
    student,
    isOnboarded,
    isLoading: actuallyLoading,
    error,
    refetch
  }
} 