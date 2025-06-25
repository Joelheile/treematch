import { renderHook } from '@testing-library/react'
import { useCurrentStudent } from '@/hooks/useCurrentStudent'
import { useAuth } from '@/app/auth/AuthProvider'
import { useStudentByEmail } from '@/integrations/supabase/useStudentByEmail'

jest.mock('@/app/auth/AuthProvider')
jest.mock('@/integrations/supabase/useStudentByEmail')

const mockUseAuth = jest.mocked(useAuth)
const mockUseStudentByEmail = jest.mocked(useStudentByEmail)

describe('useCurrentStudent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('when user is authenticated', () => {
    it('should fetch student by email', () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      const mockStudent = {
        id: '456',
        name: 'John Doe',
        email: 'test@example.com',
        isOnboarded: true,
      }

      mockUseAuth.mockReturnValue({
        user: mockUser,
        session: { user: mockUser },
        loading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        signInWithGoogle: jest.fn(),
      })

      mockUseStudentByEmail.mockReturnValue({
        data: { data: mockStudent },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      })

      const { result } = renderHook(() => useCurrentStudent())

      expect(mockUseStudentByEmail).toHaveBeenCalledWith('test@example.com', true)
      expect(result.current.student).toEqual(mockStudent)
      expect(result.current.isOnboarded).toBe(true)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should determine onboarding status correctly when student exists', () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      const mockStudent = {
        id: '456',
        name: 'John Doe',
        email: 'test@example.com',
        isOnboarded: true,
      }

      mockUseAuth.mockReturnValue({
        user: mockUser,
        session: { user: mockUser },
        loading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        signInWithGoogle: jest.fn(),
      })

      mockUseStudentByEmail.mockReturnValue({
        data: { data: mockStudent },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      })

      const { result } = renderHook(() => useCurrentStudent())

      expect(result.current.isOnboarded).toBe(true)
    })

    it('should return false for onboarding when student is not onboarded', () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      const mockStudent = {
        id: '456',
        name: 'John Doe',
        email: 'test@example.com',
        isOnboarded: false,
      }

      mockUseAuth.mockReturnValue({
        user: mockUser,
        session: { user: mockUser },
        loading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        signInWithGoogle: jest.fn(),
      })

      mockUseStudentByEmail.mockReturnValue({
        data: { data: mockStudent },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      })

      const { result } = renderHook(() => useCurrentStudent())

      expect(result.current.isOnboarded).toBe(false)
    })

    it('should handle loading state', () => {
      const mockUser = { id: '123', email: 'test@example.com' }

      mockUseAuth.mockReturnValue({
        user: mockUser,
        session: { user: mockUser },
        loading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        signInWithGoogle: jest.fn(),
      })

      mockUseStudentByEmail.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: jest.fn(),
      })

      const { result } = renderHook(() => useCurrentStudent())

      expect(result.current.isLoading).toBe(true)
      expect(result.current.student).toBeUndefined()
      expect(result.current.isOnboarded).toBe(false)
    })

    it('should handle error state', () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      const mockError = new Error('Database error')

      mockUseAuth.mockReturnValue({
        user: mockUser,
        session: { user: mockUser },
        loading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        signInWithGoogle: jest.fn(),
      })

      mockUseStudentByEmail.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: mockError,
        refetch: jest.fn(),
      })

      const { result } = renderHook(() => useCurrentStudent())

      expect(result.current.error).toBe(mockError)
      expect(result.current.student).toBeUndefined()
      expect(result.current.isOnboarded).toBe(false)
    })

    it('should provide refetch function', () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      const mockRefetch = jest.fn()

      mockUseAuth.mockReturnValue({
        user: mockUser,
        session: { user: mockUser },
        loading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        signInWithGoogle: jest.fn(),
      })

      mockUseStudentByEmail.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      })

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
        signInWithGoogle: jest.fn(),
      })

      mockUseStudentByEmail.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      })

      const { result } = renderHook(() => useCurrentStudent())

      expect(mockUseStudentByEmail).toHaveBeenCalledWith('', false)
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
        signInWithGoogle: jest.fn(),
      })

      mockUseStudentByEmail.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      })

      const { result } = renderHook(() => useCurrentStudent())

      expect(result.current.isOnboarded).toBe(false)
    })
  })

  describe('when student data is null', () => {
    it('should return false for onboarding status', () => {
      const mockUser = { id: '123', email: 'test@example.com' }

      mockUseAuth.mockReturnValue({
        user: mockUser,
        session: { user: mockUser },
        loading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        signInWithGoogle: jest.fn(),
      })

      mockUseStudentByEmail.mockReturnValue({
        data: { data: null },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      })

      const { result } = renderHook(() => useCurrentStudent())

      expect(result.current.student).toBeNull()
      expect(result.current.isOnboarded).toBe(false)
    })
  })

  describe('when student exists but isOnboarded is null', () => {
    it('should return false for onboarding status', () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      const mockStudent = {
        id: '456',
        name: 'John Doe',
        email: 'test@example.com',
        isOnboarded: null,
      }

      mockUseAuth.mockReturnValue({
        user: mockUser,
        session: { user: mockUser },
        loading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        signInWithGoogle: jest.fn(),
      })

      mockUseStudentByEmail.mockReturnValue({
        data: { data: mockStudent },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      })

      const { result } = renderHook(() => useCurrentStudent())

      expect(result.current.isOnboarded).toBe(false)
    })
  })

  describe('when user email is undefined', () => {
    it('should handle undefined email gracefully', () => {
      const mockUser = { id: '123', email: undefined }

      mockUseAuth.mockReturnValue({
        user: mockUser,
        session: { user: mockUser },
        loading: false,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        signInWithGoogle: jest.fn(),
      })

      mockUseStudentByEmail.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      })

      const { result } = renderHook(() => useCurrentStudent())

      expect(mockUseStudentByEmail).toHaveBeenCalledWith('', false)
      expect(result.current.student).toBeUndefined()
      expect(result.current.isOnboarded).toBe(false)
    })
  })
})