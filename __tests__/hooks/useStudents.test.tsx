import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useStudents } from '@/integrations/supabase/useStudents'
import { supabase } from '@/integrations/supabase/client-ssr'

jest.mock('@/integrations/supabase/client-ssr')

const mockFrom = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  supabase.from = mockFrom
})

const thenableQuery = <T,>(result: Promise<T>, extra: Record<string, jest.Mock> = {}) => ({
  select: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  ...extra,
  then: result.then.bind(result),
  catch: result.catch.bind(result),
  finally: result.finally.bind(result),
})

const mockStudentsTable = (createQuery: () => object) => {
  mockFrom.mockImplementation((table: string) =>
    table === 'students' ? { select: jest.fn(() => createQuery()) } : undefined,
  )
}

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useStudents', () => {
  it('should fetch students with skills successfully', async () => {
    const react = { id: 'skill1', name: 'React', is_global: true }
    const node = { id: 'skill2', name: 'Node.js', is_global: true }
    const rows = [
      { id: '1', name: 'John Doe', email: 'john@example.com', isOnboarded: true, student_skills: [{ skills: react }] },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', isOnboarded: true, student_skills: [{ skills: node }] },
    ]
    mockStudentsTable(() => thenableQuery(Promise.resolve({ data: rows, error: null, count: 2 })))

    const { result } = renderHook(() => useStudents(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
      expect(result.current.data).toEqual({
        data: [
          { id: '1', name: 'John Doe', email: 'john@example.com', isOnboarded: true, skills: [react] },
          { id: '2', name: 'Jane Smith', email: 'jane@example.com', isOnboarded: true, skills: [node] },
        ],
        totalCount: 2,
        hasMore: false,
      })
    })
  })

  it('should apply search filters correctly', async () => {
    const orSpy = jest.fn().mockReturnThis()
    mockStudentsTable(() =>
      thenableQuery(Promise.resolve({ data: [], error: null, count: 0 }), { or: orSpy }),
    )

    renderHook(() => useStudents({ filters: { search: 'john' } }), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(orSpy).toHaveBeenCalledWith(
        'name.ilike.%john%,email.ilike.%john%,coolest_thing.ilike.%john%',
      )
    })
  })

  it('should handle database errors', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    const dbError = new Error('Database connection failed')
    mockStudentsTable(() => thenableQuery(Promise.reject(dbError)))

    const { result } = renderHook(() => useStudents(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
      expect(result.current.error).toBe(dbError)
    })
  })
})
