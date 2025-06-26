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
  it('should fetch students with skills successfully', async () => {
    const mockStudents = [
      { id: '1', name: 'John Doe', email: 'john@example.com', isOnboarded: true },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', isOnboarded: true },
    ]

    const mockSkillsData = [
      { student_id: '1', skills: { id: 'skill1', name: 'React', is_global: true } },
      { student_id: '2', skills: { id: 'skill2', name: 'Node.js', is_global: true } },
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

    const skillsQuery = {
      select: jest.fn().mockReturnThis(),
      in: jest.fn().mockResolvedValue({
        data: mockSkillsData,
        error: null,
      }),
    }

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'students') {
        return { select: jest.fn(() => createStudentsQuery()) }
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

  it('should apply search filters correctly', async () => {
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
        return Promise.resolve({ data: [], error: null, count: 0 }).then(onResolve, onReject)
      }
      
      query.catch = function(onReject: any) {
        return Promise.resolve({ data: [], error: null, count: 0 }).catch(onReject)
      }
      
      return query
    }

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'students') {
        return { select: jest.fn(() => createStudentsQuery()) }
      }
    })

    const wrapper = createWrapper()
    renderHook(() => useStudents({ filters: { search: 'john' } }), { wrapper })

    await waitFor(() => {
      expect(orSpy).toHaveBeenCalledWith(
        'name.ilike.%john%,email.ilike.%john%,coolest_thing.ilike.%john%'
      )
    })
  })

  it('should handle pagination correctly', async () => {
    const rangeSpy = jest.fn().mockReturnThis()
    
    const createStudentsQuery = () => {
      const query = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: rangeSpy,
        eq: jest.fn().mockReturnThis(),
      }
      
      query.then = function(onResolve: any, onReject?: any) {
        return Promise.resolve({ data: [], error: null, count: 0 }).then(onResolve, onReject)
      }
      
      query.catch = function(onReject: any) {
        return Promise.resolve({ data: [], error: null, count: 0 }).catch(onReject)
      }
      
      return query
    }

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'students') {
        return { select: jest.fn(() => createStudentsQuery()) }
      }
    })

    const wrapper = createWrapper()
    renderHook(() => useStudents({ limit: 10, offset: 20 }), { wrapper })

    await waitFor(() => {
      expect(rangeSpy).toHaveBeenCalledWith(20, 29)
    })
  })

  it('should handle database errors', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    
    const dbError = new Error('Database connection failed')
    
    const createStudentsQuery = () => {
      const query = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      }
      
      const rejectedPromise = Promise.reject(dbError)
      query.then = rejectedPromise.then.bind(rejectedPromise)
      query.catch = rejectedPromise.catch.bind(rejectedPromise)
      query.finally = rejectedPromise.finally?.bind(rejectedPromise)
      
      return query
    }

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'students') {
        return { select: jest.fn(() => createStudentsQuery()) }
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