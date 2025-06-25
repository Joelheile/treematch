import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useStudents, StudentSearchOptions } from '@/integrations/supabase/useStudents'
import { supabase } from '@/integrations/supabase/client'

jest.mock('@/integrations/supabase/client')

const mockSupabase = {
  from: jest.fn(),
}

beforeEach(() => {
  ;(supabase as any).from = mockSupabase.from
})

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useStudents', () => {
  describe('when fetching students with default options', () => {
    it('should return paginated students with skills', async () => {
      const mockStudents = [
        { id: '1', name: 'John Doe', email: 'john@example.com', isOnboarded: true },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', isOnboarded: true },
      ]

      const mockSkillsData = [
        { student_id: '1', skills: { id: 'skill1', name: 'React', is_global: true } },
        { student_id: '2', skills: { id: 'skill2', name: 'Node.js', is_global: true } },
      ]

      // Create a proper promise chain mock
      const createStudentsQuery = () => {
        const query = {
          select: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          range: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
        }
        
        // Add promise methods
        query.then = function(onResolve: any, onReject?: any) {
          return Promise.resolve({
            data: mockStudents,
            error: null,
            count: 2,
          }).then(onResolve, onReject)
        }
        
        query.catch = function(onReject: any) {
          return Promise.resolve({
            data: mockStudents,
            error: null,
            count: 2,
          }).catch(onReject)
        }
        
        return query
      }

      // Mock the skills query
      const skillsQuery = {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: mockSkillsData,
          error: null,
        }),
      }

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'students') {
          return {
            select: jest.fn(() => createStudentsQuery()),
          }
        }
        if (table === 'student_skills') {
          return skillsQuery
        }
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useStudents(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
        expect(result.current.data).toEqual({
          data: [
            { ...mockStudents[0], skills: [{ id: 'skill1', name: 'React', is_global: true }] },
            { ...mockStudents[1], skills: [{ id: 'skill2', name: 'Node.js', is_global: true }] },
          ],
          totalCount: 2,
          hasMore: false,
        })
      })
    })

    it('should apply default filters for onboarded students', async () => {
      const eqSpy = jest.fn().mockReturnThis()
      
      const createStudentsQuery = () => {
        const query = {
          select: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          range: jest.fn().mockReturnThis(),
          eq: eqSpy,
        }
        
        query.then = function(onResolve: any, onReject?: any) {
          return Promise.resolve({
            data: [],
            error: null,
            count: 0,
          }).then(onResolve, onReject)
        }
        
        query.catch = function(onReject: any) {
          return Promise.resolve({
            data: [],
            error: null,
            count: 0,
          }).catch(onReject)
        }
        
        return query
      }

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'students') {
          return {
            select: jest.fn(() => createStudentsQuery()),
          }
        }
      })

      const wrapper = createWrapper()
      renderHook(() => useStudents(), { wrapper })

      await waitFor(() => {
        expect(eqSpy).toHaveBeenCalledWith('isOnboarded', true)
      })
    })
  })

  describe('when applying filters', () => {
    it('should filter by country', async () => {
      const eqSpy = jest.fn().mockReturnThis()
      
      const createStudentsQuery = () => {
        const query = {
          select: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          range: jest.fn().mockReturnThis(),
          eq: eqSpy,
        }
        
        query.then = function(onResolve: any, onReject?: any) {
          return Promise.resolve({
            data: [],
            error: null,
            count: 0,
          }).then(onResolve, onReject)
        }
        
        query.catch = function(onReject: any) {
          return Promise.resolve({
            data: [],
            error: null,
            count: 0,
          }).catch(onReject)
        }
        
        return query
      }

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'students') {
          return {
            select: jest.fn(() => createStudentsQuery()),
          }
        }
      })

      const options: StudentSearchOptions = {
        filters: { country: 'USA', isOnboarded: true },
      }

      const wrapper = createWrapper()
      renderHook(() => useStudents(options), { wrapper })

      await waitFor(() => {
        expect(eqSpy).toHaveBeenCalledWith('country', 'USA')
        expect(eqSpy).toHaveBeenCalledWith('isOnboarded', true)
      })
    })

    it('should filter by LinkedIn presence', async () => {
      const notSpy = jest.fn().mockReturnThis()
      
      const createStudentsQuery = () => {
        const query = {
          select: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          range: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          not: notSpy,
        }
        
        query.then = function(onResolve: any, onReject?: any) {
          return Promise.resolve({
            data: [],
            error: null,
            count: 0,
          }).then(onResolve, onReject)
        }
        
        query.catch = function(onReject: any) {
          return Promise.resolve({
            data: [],
            error: null,
            count: 0,
          }).catch(onReject)
        }
        
        return query
      }

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'students') {
          return {
            select: jest.fn(() => createStudentsQuery()),
          }
        }
      })

      const options: StudentSearchOptions = {
        filters: { hasLinkedIn: true },
      }

      const wrapper = createWrapper()
      renderHook(() => useStudents(options), { wrapper })

      await waitFor(() => {
        expect(notSpy).toHaveBeenCalledWith('linkedin', 'is', null)
      })
    })

    it('should filter by search term', async () => {
      const orSpy = jest.fn().mockReturnThis()
      
      const createStudentsQuery = () => {
        const query = {
          select: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          range: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          or: orSpy,
        }
        
        query.then = function(onResolve: any, onReject?: any) {
          return Promise.resolve({
            data: [],
            error: null,
            count: 0,
          }).then(onResolve, onReject)
        }
        
        query.catch = function(onReject: any) {
          return Promise.resolve({
            data: [],
            error: null,
            count: 0,
          }).catch(onReject)
        }
        
        return query
      }

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'students') {
          return {
            select: jest.fn(() => createStudentsQuery()),
          }
        }
      })

      const options: StudentSearchOptions = {
        filters: { search: 'john' },
      }

      const wrapper = createWrapper()
      renderHook(() => useStudents(options), { wrapper })

      await waitFor(() => {
        expect(orSpy).toHaveBeenCalledWith(
          'name.ilike.%john%,email.ilike.%john%,current_project.ilike.%john%'
        )
      })
    })
  })

  describe('when filtering by skills', () => {
    it('should filter students by skill IDs', async () => {
      const mockStudents = [
        { id: '1', name: 'John Doe', email: 'john@example.com', isOnboarded: true },
      ]

      const mockStudentSkills = [
        { student_id: '1' },
      ]

      const createStudentsQuery = () => {
        const query = {
          select: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          range: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
        }
        
        query.then = function(onResolve: any, onReject?: any) {
          return Promise.resolve({
            data: mockStudents,
            error: null,
            count: 1,
          }).then(onResolve, onReject)
        }
        
        query.catch = function(onReject: any) {
          return Promise.resolve({
            data: mockStudents,
            error: null,
            count: 1,
          }).catch(onReject)
        }
        
        return query
      }

      const studentSkillsQuery = {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: mockStudentSkills,
          error: null,
        }),
      }

      const allSkillsQuery = {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'students') {
          return { select: jest.fn(() => createStudentsQuery()) }
        }
        if (table === 'student_skills') {
          // First call for filtering, second call for fetching all skills
          let callCount = 0
          return {
            select: jest.fn(() => {
              callCount++
              return callCount === 1 ? studentSkillsQuery : allSkillsQuery
            }),
          }
        }
      })

      const options: StudentSearchOptions = {
        filters: { skillIds: ['skill1'] },
      }

      const wrapper = createWrapper()
      const { result } = renderHook(() => useStudents(options), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(studentSkillsQuery.in).toHaveBeenCalledWith('skill_id', ['skill1'])
    })
  })

  describe('when no students found', () => {
    it('should return empty data with zero count', async () => {
      const createStudentsQuery = () => {
        const query = {
          select: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          range: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
        }
        
        query.then = function(onResolve: any, onReject?: any) {
          return Promise.resolve({
            data: [],
            error: null,
            count: 0,
          }).then(onResolve, onReject)
        }
        
        query.catch = function(onReject: any) {
          return Promise.resolve({
            data: [],
            error: null,
            count: 0,
          }).catch(onReject)
        }
        
        return query
      }

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'students') {
          return {
            select: jest.fn(() => createStudentsQuery()),
          }
        }
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useStudents(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
        expect(result.current.data).toEqual({
          data: [],
          totalCount: 0,
          hasMore: false,
        })
      })
    })
  })

  describe('when database error occurs', () => {
    it('should throw error from students query', async () => {
      // Suppress expected console error
      jest.spyOn(console, 'error').mockImplementation(() => {})
      
      const dbError = new Error('Database connection failed')
      
      const createStudentsQuery = () => {
        const query = {
          select: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          range: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
        }
        
        // Make this behave like a rejected promise
        const rejectedPromise = Promise.reject(dbError)
        query.then = rejectedPromise.then.bind(rejectedPromise)
        query.catch = rejectedPromise.catch.bind(rejectedPromise)
        query.finally = rejectedPromise.finally?.bind(rejectedPromise)
        
        return query
      }

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'students') {
          return {
            select: jest.fn(() => createStudentsQuery()),
          }
        }
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useStudents(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
        expect(result.current.error).toBe(dbError)
      })
    })
  })

  describe('with pagination options', () => {
    it('should apply limit and offset correctly', async () => {
      const rangeSpy = jest.fn().mockReturnThis()
      
      const createStudentsQuery = () => {
        const query = {
          select: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          range: rangeSpy,
          eq: jest.fn().mockReturnThis(),
        }
        
        query.then = function(onResolve: any, onReject?: any) {
          return Promise.resolve({
            data: [],
            error: null,
            count: 0,
          }).then(onResolve, onReject)
        }
        
        query.catch = function(onReject: any) {
          return Promise.resolve({
            data: [],
            error: null,
            count: 0,
          }).catch(onReject)
        }
        
        return query
      }

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'students') {
          return {
            select: jest.fn(() => createStudentsQuery()),
          }
        }
      })

      const options: StudentSearchOptions = {
        limit: 10,
        offset: 20,
      }

      const wrapper = createWrapper()
      renderHook(() => useStudents(options), { wrapper })

      await waitFor(() => {
        expect(rangeSpy).toHaveBeenCalledWith(20, 29)
      })
    })

    it('should calculate hasMore correctly', async () => {
      const mockStudents = Array.from({ length: 20 }, (_, i) => ({
        id: `student-${i}`,
        name: `Student ${i}`,
        email: `student${i}@stanford.edu`,
        isOnboarded: true
      }))

      const createStudentsQuery = () => {
        const query = {
          select: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          range: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
        }
        
        query.then = function(onResolve: any, onReject?: any) {
          return Promise.resolve({
            data: mockStudents,
            error: null,
            count: 100, // Total count is 100
          }).then(onResolve, onReject)
        }
        
        query.catch = function(onReject: any) {
          return Promise.resolve({
            data: mockStudents,
            error: null,
            count: 100,
          }).catch(onReject)
        }
        
        return query
      }

      const skillsQuery = {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'students') {
          return {
            select: jest.fn(() => createStudentsQuery()),
          }
        }
        if (table === 'student_skills') {
          return skillsQuery
        }
      })

      const options: StudentSearchOptions = {
        limit: 20,
        offset: 0,
      }

      const wrapper = createWrapper()
      const { result } = renderHook(() => useStudents(options), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
        expect(result.current.data?.hasMore).toBe(true) // 0 + 20 < 100 = true
        expect(result.current.data?.totalCount).toBe(100)
      })
    })
  })
})