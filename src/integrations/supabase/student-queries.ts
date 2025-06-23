import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { studentService, type Student, type StudentInsert, type StudentUpdate, type StudentFilters, type QueryOptions } from './student-service'
import { toast } from 'sonner'

export const studentQueryKeys = {
  all: ['students'] as const,
  lists: () => [...studentQueryKeys.all, 'list'] as const,
  list: (filters?: StudentFilters) => [...studentQueryKeys.lists(), { filters }] as const,
  details: () => [...studentQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...studentQueryKeys.details(), id] as const,
  byEmail: (email: string) => [...studentQueryKeys.all, 'email', email] as const,
  bySkill: (skill: string) => [...studentQueryKeys.all, 'skill', skill] as const,
  byCountry: (country: string) => [...studentQueryKeys.all, 'country', country] as const,
  withMetadata: () => [...studentQueryKeys.all, 'metadata'] as const,
  analytics: () => [...studentQueryKeys.all, 'analytics'] as const,
}

export const useStudents = (filters?: StudentFilters, options?: QueryOptions) => {
  return useQuery({
    queryKey: studentQueryKeys.list(filters),
    queryFn: () => studentService.searchStudents({ filters, ...options }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useInfiniteStudents = (filters?: StudentFilters, options?: Omit<QueryOptions, 'offset'>) => {
  return useInfiniteQuery({
    queryKey: [...studentQueryKeys.list(filters), 'infinite'],
    queryFn: ({ pageParam = 0 }) => 
      studentService.searchStudents({ 
        filters, 
        ...options, 
        offset: pageParam 
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.data || !lastPage.hasMore) return undefined
      return (lastPage.nextCursor ? parseInt(lastPage.nextCursor) : 0)
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useStudent = (id: string, enabled = true) => {
  return useQuery({
    queryKey: studentQueryKeys.detail(id),
    queryFn: () => studentService.getStudentById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useStudentByEmail = (email: string, enabled = true) => {
  return useQuery({
    queryKey: studentQueryKeys.byEmail(email),
    queryFn: () => studentService.getStudentByEmail(email),
    enabled: enabled && !!email,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useStudentsBySkill = (skill: string, options?: QueryOptions) => {
  return useQuery({
    queryKey: studentQueryKeys.bySkill(skill),
    queryFn: () => studentService.getStudentsBySkill(skill, options),
    enabled: !!skill,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useStudentsByCountry = (country: string, options?: QueryOptions) => {
  return useQuery({
    queryKey: studentQueryKeys.byCountry(country),
    queryFn: () => studentService.getStudentsByCountry(country, options),
    enabled: !!country,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useStudentsWithMetadata = (options?: QueryOptions) => {
  return useQuery({
    queryKey: studentQueryKeys.withMetadata(),
    queryFn: () => studentService.getStudentsWithMetadata(options),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useStudentAnalytics = () => {
  return useQuery({
    queryKey: studentQueryKeys.analytics(),
    queryFn: () => studentService.getStudentAnalytics(),
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export const useCreateStudent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (student: StudentInsert) => studentService.createStudent(student),
    onSuccess: (result) => {
      if (result.data) {
        queryClient.invalidateQueries({ queryKey: studentQueryKeys.lists() })
        queryClient.invalidateQueries({ queryKey: studentQueryKeys.analytics() })
        
        queryClient.setQueryData(
          studentQueryKeys.detail(result.data.id),
          result
        )
        
        toast.success('Student created successfully')
      } else {
        toast.error(result.error || 'Failed to create student')
      }
    },
    onError: (error) => {
      toast.error('Failed to create student')
      console.error('Create student error:', error)
    },
  })
}

export const useUpdateStudent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: StudentUpdate }) => 
      studentService.updateStudent(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: studentQueryKeys.detail(id) })

      const previousStudent = queryClient.getQueryData(studentQueryKeys.detail(id))

      queryClient.setQueryData(studentQueryKeys.detail(id), (old: any) => {
        if (!old?.data) return old
        return {
          ...old,
          data: { ...old.data, ...updates }
        }
      })

      return { previousStudent }
    },
    onSuccess: (result, { id }) => {
      if (result.data) {
        queryClient.setQueryData(studentQueryKeys.detail(id), result)
        
        queryClient.invalidateQueries({ queryKey: studentQueryKeys.lists() })
        queryClient.invalidateQueries({ queryKey: studentQueryKeys.analytics() })
        
        toast.success('Student updated successfully')
      } else {
        toast.error(result.error || 'Failed to update student')
      }
    },
    onError: (error, { id }, context) => {
      if (context?.previousStudent) {
        queryClient.setQueryData(studentQueryKeys.detail(id), context.previousStudent)
      }
      toast.error('Failed to update student')
      console.error('Update student error:', error)
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: studentQueryKeys.detail(id) })
    },
  })
}

export const useDeleteStudent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => studentService.deleteStudent(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: studentQueryKeys.detail(id) })

      queryClient.removeQueries({ queryKey: studentQueryKeys.detail(id) })

      queryClient.setQueriesData(
        { queryKey: studentQueryKeys.lists() },
        (old: any) => {
          if (!old?.data) return old
          return {
            ...old,
            data: old.data.filter((student: Student) => student.id !== id)
          }
        }
      )

      return { id }
    },
    onSuccess: (result, id) => {
      if (result.data) {
        queryClient.invalidateQueries({ queryKey: studentQueryKeys.lists() })
        queryClient.invalidateQueries({ queryKey: studentQueryKeys.analytics() })
        
        toast.success('Student deleted successfully')
      } else {
        toast.error(result.error || 'Failed to delete student')
      }
    },
    onError: (error, id) => {
      queryClient.invalidateQueries({ queryKey: studentQueryKeys.lists() })
      toast.error('Failed to delete student')
      console.error('Delete student error:', error)
    },
  })
}

export const useCreateMultipleStudents = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (students: StudentInsert[]) => studentService.createMultipleStudents(students),
    onSuccess: (result) => {
      if (result.data) {
        queryClient.invalidateQueries({ queryKey: studentQueryKeys.all })
        
        toast.success(`${result.data.length} students created successfully`)
      } else {
        toast.error(result.error || 'Failed to create students')
      }
    },
    onError: (error) => {
      toast.error('Failed to create students')
      console.error('Create multiple students error:', error)
    },
  })
}

export const useStudentCache = () => {
  const queryClient = useQueryClient()

  const prefetchStudent = (id: string) => {
    return queryClient.prefetchQuery({
      queryKey: studentQueryKeys.detail(id),
      queryFn: () => studentService.getStudentById(id),
      staleTime: 5 * 60 * 1000,
    })
  }

  const prefetchStudents = (filters?: StudentFilters) => {
    return queryClient.prefetchQuery({
      queryKey: studentQueryKeys.list(filters),
      queryFn: () => studentService.searchStudents({ filters }),
      staleTime: 5 * 60 * 1000,
    })
  }

  const invalidateStudent = (id: string) => {
    queryClient.invalidateQueries({ queryKey: studentQueryKeys.detail(id) })
  }

  const invalidateAllStudents = () => {
    queryClient.invalidateQueries({ queryKey: studentQueryKeys.all })
  }

  const removeStudent = (id: string) => {
    queryClient.removeQueries({ queryKey: studentQueryKeys.detail(id) })
  }

  const setStudent = (id: string, data: Student) => {
    queryClient.setQueryData(studentQueryKeys.detail(id), { data, error: null })
  }

  return {
    prefetchStudent,
    prefetchStudents,
    invalidateStudent,
    invalidateAllStudents,
    removeStudent,
    setStudent,
  }
} 