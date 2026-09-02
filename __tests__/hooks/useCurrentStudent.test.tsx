import { renderHook } from '@testing-library/react'
import { useCurrentStudent } from '@/hooks/useCurrentStudent'
import { useAuth } from '@/app/auth/AuthProvider'
import { useStudentByUserId } from '@/integrations/supabase/useStudentByUserId'
import type { ServiceResponse } from '@/integrations/supabase/useStudentByUserId'
import type { StudentWithSkills } from '@/integrations/supabase/useStudents'
import type { Session, User } from '@supabase/supabase-js'
import type { UseQueryResult } from '@tanstack/react-query'

jest.mock('@/app/auth/AuthProvider')
jest.mock('@/integrations/supabase/useStudentByUserId')

const mockUseAuth = jest.mocked(useAuth)
const mockUseStudentByUserId = jest.mocked(useStudentByUserId)

const mockUser = { id: '123', email: 'test@example.com' } as User
const mockSession = { user: mockUser } as Session

type StudentQuery = UseQueryResult<ServiceResponse<StudentWithSkills>>
const queryResult = (partial: Partial<StudentQuery>) => partial as StudentQuery

describe('useCurrentStudent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('when user is authenticated', () => {
    it('should fetch student by user id', () => {
      const mockStudent = {
        id: '456',
        name: 'John Doe',
        email: 'test@example.com',
        isOnboarded: true,
      } as StudentWithSkills

      mockUseAuth.mockReturnValue({
        user: mockUser,
        session: mockSession,
        loading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
      })

      mockUseStudentByUserId.mockReturnValue(queryResult({
        data: { data: mockStudent, error: null },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      }))

      const { result } = renderHook(() => useCurrentStudent())

      expect(mockUseStudentByUserId).toHaveBeenCalledWith('123', true)
      expect(result.current.student).toEqual(mockStudent)
      expect(result.current.isOnboarded).toBe(true)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should determine onboarding status correctly when student exists', () => {
      const mockStudent = {
        id: '456',
        name: 'John Doe',
        email: 'test@example.com',
        isOnboarded: true,
      } as StudentWithSkills

      mockUseAuth.mockReturnValue({
        user: mockUser,
        session: mockSession,
        loading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
      })

      mockUseStudentByUserId.mockReturnValue(queryResult({
        data: { data: mockStudent, error: null },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      }))

      const { result } = renderHook(() => useCurrentStudent())

      expect(result.current.isOnboarded).toBe(true)
    })

    it('should return false for onboarding when student is not onboarded', () => {
      const mockStudent = {
        id: '456',
        name: 'John Doe',
        email: 'test@example.com',
        isOnboarded: false,
      } as StudentWithSkills

      mockUseAuth.mockReturnValue({
        user: mockUser,
        session: mockSession,
        loading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
      })

      mockUseStudentByUserId.mockReturnValue(queryResult({
        data: { data: mockStudent, error: null },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      }))

      const { result } = renderHook(() => useCurrentStudent())

      expect(result.current.isOnboarded).toBe(false)
    })

    it('should handle loading state', () => {

      mockUseAuth.mockReturnValue({
        user: mockUser,
        session: mockSession,
        loading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
      })

      mockUseStudentByUserId.mockReturnValue(queryResult({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: jest.fn(),
      }))

      const { result } = renderHook(() => useCurrentStudent())

      expect(result.current.isLoading).toBe(true)
      expect(result.current.student).toBeUndefined()
      expect(result.current.isOnboarded).toBe(false)
    })

    it('should handle error state', () => {
      const mockError = new Error('Database error')

      mockUseAuth.mockReturnValue({
        user: mockUser,
        session: mockSession,
        loading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
      })

      mockUseStudentByUserId.mockReturnValue(queryResult({
        data: undefined,
        isLoading: false,
        error: mockError,
        refetch: jest.fn(),
      }))

      const { result } = renderHook(() => useCurrentStudent())

      expect(result.current.error).toBe(mockError)
      expect(result.current.student).toBeUndefined()
      expect(result.current.isOnboarded).toBe(false)
    })

    it('should provide refetch function', () => {
      const mockRefetch = jest.fn()

      mockUseAuth.mockReturnValue({
        user: mockUser,
        session: mockSession,
        loading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
      })

      mockUseStudentByUserId.mockReturnValue(queryResult({
        data: undefined,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      }))

      const { result } = renderHook(() => useCurrentStudent())

      expect(result.current.refetch).toBe(mockRefetch)
    })
  })

  describe('when user is not authenticated', () => {
    it('should not fetch student data', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        session: null,
        loading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
      })

      mockUseStudentByUserId.mockReturnValue(queryResult({
        data: undefined,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      }))

      const { result } = renderHook(() => useCurrentStudent())

      expect(mockUseStudentByUserId).toHaveBeenCalledWith('', false)
      expect(result.current.student).toBeUndefined()
      expect(result.current.isOnboarded).toBe(false)
    })

    it('should return false for onboarding when no user', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        session: null,
        loading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
      })

      mockUseStudentByUserId.mockReturnValue(queryResult({
        data: undefined,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      }))

      const { result } = renderHook(() => useCurrentStudent())

      expect(result.current.isOnboarded).toBe(false)
    })
  })

  describe('when student data is null', () => {
    it('should return false for onboarding status', () => {

      mockUseAuth.mockReturnValue({
        user: mockUser,
        session: mockSession,
        loading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
      })

      mockUseStudentByUserId.mockReturnValue(queryResult({
        data: { data: null, error: null },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      }))

      const { result } = renderHook(() => useCurrentStudent())

      expect(result.current.student).toBeNull()
      expect(result.current.isOnboarded).toBe(false)
    })
  })

  describe('when student exists but isOnboarded is null', () => {
    it('should return false for onboarding status', () => {
      const mockStudent = {
        id: '456',
        name: 'John Doe',
        email: 'test@example.com',
        isOnboarded: null,
      } as StudentWithSkills

      mockUseAuth.mockReturnValue({
        user: mockUser,
        session: mockSession,
        loading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
      })

      mockUseStudentByUserId.mockReturnValue(queryResult({
        data: { data: mockStudent, error: null },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      }))

      const { result } = renderHook(() => useCurrentStudent())

      expect(result.current.isOnboarded).toBe(false)
    })
  })
})