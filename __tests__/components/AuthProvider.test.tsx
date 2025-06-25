import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { AuthProvider, useAuth } from '@/app/auth/AuthProvider'

// Mock the createClient function
const mockSupabase = {
  auth: {
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    signInWithOAuth: jest.fn(),
  },
}

jest.mock('@/integrations/supabase/client-ssr', () => ({
  createClient: jest.fn(() => mockSupabase),
}))

// Suppress console.log messages from AuthProvider
beforeEach(() => {
  jest.clearAllMocks()
  jest.spyOn(console, 'log').mockImplementation(() => {})
  jest.spyOn(console, 'error').mockImplementation(() => {})
  
  mockSupabase.auth.onAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: jest.fn() } },
  })
})

afterEach(() => {
  jest.restoreAllMocks()
})

const TestComponent = () => {
  const { user, session, loading, signIn, signUp, signOut, signInWithGoogle } = useAuth()
  const [error, setError] = useState<string | null>(null)
  
  const handleSignIn = async () => {
    try {
      await signIn('test@example.com', 'password')
    } catch (err: any) {
      setError(err.message)
    }
  }
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="user">{user ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="session">{session ? 'has-session' : 'no-session'}</div>
      {error && <div data-testid="error">{error}</div>}
      <button onClick={handleSignIn}>Sign In</button>
      <button onClick={() => signUp('test@example.com', 'password')}>Sign Up</button>
      <button onClick={() => signOut()}>Sign Out</button>
      <button onClick={() => signInWithGoogle()}>Sign In with Google</button>
    </div>
  )
}

describe('AuthProvider', () => {
  describe('when component mounts', () => {
    it('should start with loading state', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )
      })

      expect(screen.getByTestId('loading')).toHaveTextContent('loading')
    })

    it('should fetch initial session on mount', async () => {
      const mockSession = { user: { id: '123', email: 'test@example.com' } }
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(mockSupabase.auth.getSession).toHaveBeenCalled()
      })
    })
  })

  describe('when session exists', () => {
    it('should set user and session state', async () => {
      const mockSession = { user: { id: '123', email: 'test@example.com' } }
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('authenticated')
        expect(screen.getByTestId('session')).toHaveTextContent('has-session')
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
      })
    })
  })

  describe('when session is null', () => {
    it('should set user and session to null', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('not-authenticated')
        expect(screen.getByTestId('session')).toHaveTextContent('no-session')
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
      })
    })
  })

  describe('when getSession throws session_not_found error', () => {
    it('should clear auth data and stop loading', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'session_not_found', code: 'session_not_found' },
      })

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('not-authenticated')
        expect(screen.getByTestId('session')).toHaveTextContent('no-session')
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
      })
    })
  })

  describe('when signIn is called', () => {
    it('should call supabase signInWithPassword', async () => {
      const user = userEvent.setup()
      
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: '123' }, session: { user: { id: '123' } } },
        error: null,
      })

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
      })

      await act(async () => {
        await user.click(screen.getByText('Sign In'))
      })

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      })
    })

    it('should throw error when signInWithPassword fails', async () => {
      const user = userEvent.setup()
      
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })
      
      const signInError = { message: 'Invalid credentials' }
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: signInError,
      })

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
      })

      await act(async () => {
        await user.click(screen.getByText('Sign In'))
      })

      await waitFor(() => {
        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password',
        })
        expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials')
      })
    })
  })

  describe('when signUp is called', () => {
    it('should call supabase signUp', async () => {
      const user = userEvent.setup()
      
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: { id: '123' }, session: null },
        error: null,
      })

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
      })

      await act(async () => {
        await user.click(screen.getByText('Sign Up'))
      })

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      })
    })
  })

  describe('when signOut is called', () => {
    it('should call supabase signOut when session exists', async () => {
      const user = userEvent.setup()
      const mockSession = { user: { id: '123' }, access_token: 'token', refresh_token: 'refresh' }
      
      mockSupabase.auth.getSession
        .mockResolvedValueOnce({
          data: { session: mockSession },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { session: mockSession },
          error: null,
        })
      
      mockSupabase.auth.signOut.mockResolvedValue({
        error: null,
      })

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
      })

      await act(async () => {
        await user.click(screen.getByText('Sign Out'))
      })

      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    })
  })

  describe('when signInWithGoogle is called', () => {
    it('should call supabase signInWithOAuth', async () => {
      const user = userEvent.setup()
      
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({
        data: { provider: 'google', url: 'https://google.com' },
        error: null,
      })

      // Mock window.location
      Object.defineProperty(window, 'location', {
        value: { origin: 'http://localhost:3000' },
        writable: true,
      })

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
      })

      await act(async () => {
        await user.click(screen.getByText('Sign In with Google'))
      })

      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback',
        },
      })
    })
  })

  describe('when auth state changes', () => {
    it('should update user and session state', async () => {
      let mockCallback: (event: string, session: any) => void
      
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        mockCallback = callback
        return { data: { subscription: { unsubscribe: jest.fn() } } }
      })
      
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )
      })

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
      })

      const newSession = { 
        user: { id: '456', email: 'new@example.com' },
        access_token: 'new-token',
        refresh_token: 'new-refresh'
      }
      
      // Simulate auth state change
      await act(async () => {
        mockCallback!('SIGNED_IN', newSession)
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('authenticated')
        expect(screen.getByTestId('session')).toHaveTextContent('has-session')
      })
    })

    it('should clear state when signed out', async () => {
      let mockCallback: (event: string, session: any) => void
      
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        mockCallback = callback
        return { data: { subscription: { unsubscribe: jest.fn() } } }
      })
      
      // Start with a session
      const initialSession = { 
        user: { id: '123', email: 'test@example.com' },
        access_token: 'token',
        refresh_token: 'refresh'
      }
      
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: initialSession },
        error: null,
      })

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )
      })

      // Wait for initial session to be set
      await waitFor(() => {
        expect(screen.getByTestId('session')).toHaveTextContent('has-session')
      })

      // Simulate sign out
      await act(async () => {
        mockCallback!('SIGNED_OUT', null)
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('not-authenticated')
        expect(screen.getByTestId('session')).toHaveTextContent('no-session')
      })
    })
  })
})

describe('useAuth hook', () => {
  describe('when used outside AuthProvider', () => {
    it('should throw error', () => {
      const TestComponent = () => {
        useAuth()
        return <div>Test</div>
      }

      expect(() => {
        render(<TestComponent />)
      }).toThrow('useAuth must be used within an AuthProvider')
    })
  })
})