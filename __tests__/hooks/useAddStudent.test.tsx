import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAddStudent } from '@/integrations/supabase/useAddStudent'

// Mock the entire supabase client
jest.mock('@/integrations/supabase/client-ssr', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(),
      })),
    })),
  },
}))

// Import the mocked supabase after mocking
import { supabase } from '@/integrations/supabase/client-ssr'
const mockFrom = supabase.from as jest.Mock

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

describe('useAddStudent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('when adding student without skills', () => {
    it('should create student successfully', async () => {
      const mockStudent = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        created_at: '2023-01-01T00:00:00Z',
      }

      const insertMock = jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: mockStudent,
            error: null,
          }),
        })),
      }))

      mockFrom.mockReturnValue({
        insert: insertMock,
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useAddStudent(), { wrapper })

      const studentData = {
        name: 'John Doe',
        email: 'john@example.com',
      }

      result.current.mutate({
        student: studentData,
        skillIds: [],
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockFrom).toHaveBeenCalledWith('students')
      expect(insertMock).toHaveBeenCalledWith(studentData)
      expect(result.current.data).toEqual(mockStudent)
    })

    it('should throw error when student creation fails', async () => {
      const insertError = new Error('Database error')
      
      const insertMock = jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: insertError,
          }),
        })),
      }))

      mockFrom.mockReturnValue({
        insert: insertMock,
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useAddStudent(), { wrapper })

      result.current.mutate({
        student: { name: 'John Doe', email: 'john@example.com' },
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBe(insertError)
    })
  })

  describe('when adding student with skills', () => {
    it('should create student and associate skills', async () => {
      const mockStudent = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        created_at: '2023-01-01T00:00:00Z',
      }

      const skillIds = ['skill1', 'skill2']

      const insertStudentMock = jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: mockStudent,
            error: null,
          }),
        })),
      }))

      const insertSkillsMock = jest.fn().mockResolvedValue({
        data: null,
        error: null,
      })

      mockFrom.mockImplementation((table: string) => {
        if (table === 'students') {
          return { insert: insertStudentMock }
        }
        if (table === 'student_skills') {
          return { insert: insertSkillsMock }
        }
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useAddStudent(), { wrapper })

      result.current.mutate({
        student: { name: 'John Doe', email: 'john@example.com' },
        skillIds,
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(insertStudentMock).toHaveBeenCalled()
      expect(insertSkillsMock).toHaveBeenCalledWith([
        { student_id: '123', skill_id: 'skill1' },
        { student_id: '123', skill_id: 'skill2' },
      ])
    })

    it('should rollback student creation when skill association fails', async () => {
      const mockStudent = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        created_at: '2023-01-01T00:00:00Z',
      }

      const skillError = new Error('Skill association failed')

      const insertStudentMock = jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: mockStudent,
            error: null,
          }),
        })),
      }))

      const insertSkillsMock = jest.fn().mockResolvedValue({
        data: null,
        error: skillError,
      })

      const deleteMock = jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }))

      mockFrom.mockImplementation((table: string) => {
        if (table === 'students') {
          return { 
            insert: insertStudentMock,
            delete: deleteMock,
          }
        }
        if (table === 'student_skills') {
          return { insert: insertSkillsMock }
        }
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useAddStudent(), { wrapper })

      result.current.mutate({
        student: { name: 'John Doe', email: 'john@example.com' },
        skillIds: ['skill1'],
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(deleteMock).toHaveBeenCalled()
      expect(result.current.error).toBe(skillError)
    })
  })

  describe('when mutation succeeds', () => {
    it('should invalidate students query', async () => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      })

      const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries')

      const mockStudent = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        created_at: '2023-01-01T00:00:00Z',
      }

      const insertMock = jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: mockStudent,
            error: null,
          }),
        })),
      }))

      mockFrom.mockReturnValue({
        insert: insertMock,
      })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      )

      const { result } = renderHook(() => useAddStudent(), { wrapper })

      result.current.mutate({
        student: { name: 'John Doe', email: 'john@example.com' },
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['students'],
      })
    })
  })
})