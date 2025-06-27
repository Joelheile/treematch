import { useAuth } from '@/app/auth/AuthProvider'
import { useStudentByUserId } from '@/integrations/supabase/useStudentByUserId'
import { useEffect, useState } from 'react'

export const useCurrentStudent = () => {
  const { user } = useAuth()
  const [forcedNotLoading, setForcedNotLoading] = useState(false)
  
  const {
    data: studentResponse,
    isLoading,
    error,
    refetch
  } = useStudentByUserId(user?.id || '', !!user?.id)

  const student = studentResponse?.data
  
  // Debug student data
  if (student) {
    console.log('🔍 useCurrentStudent: Student data:', {
      id: student.id,
      email: student.email,
      name: student.name,
      isOnboarded: student.isOnboarded,
      hasIsOnboardedField: 'isOnboarded' in student,
      allFields: Object.keys(student)
    })
  }
  
  const isOnboarded = student ? (student.isOnboarded === true) : false

  // Safeguard: Force loading to false after 15 seconds
  useEffect(() => {
    if (isLoading && user?.id) {
      const timeout = setTimeout(() => {
        console.warn('useCurrentStudent: Force setting loading to false after timeout')
        setForcedNotLoading(true)
      }, 15000)
      
      return () => clearTimeout(timeout)
    }
  }, [isLoading, user?.id])

  // Reset forced state when loading changes
  useEffect(() => {
    if (!isLoading) {
      setForcedNotLoading(false)
    }
  }, [isLoading])

  return {
    student,
    isOnboarded,
    isLoading: isLoading && !forcedNotLoading,
    error,
    refetch
  }
} 