import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { AuthProvider, useAuth } from '@/app/auth/AuthProvider'

const mockSupabase = {
  auth: {
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
  },
}

jest.mock('@/integrations/supabase/client-ssr', () => ({
  createClient: jest.fn(() => mockSupabase),
}))

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
  const { user, session, loading, signIn, signOut } = useAuth()
  const [error, setError] = useState<string | null>(null)
  
  const handleSignIn = async () => {
    try {
      await signIn('test@example.com', 'password')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="user">{user ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="session">{session ? 'has-session' : 'no-session'}</div>
      {error && <div data-testid="error">{error}</div>}
      <button onClick={handleSignIn}>Sign In</button>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  )
}

describe('AuthProvider', () => {
  it('should authenticate user on successful sign in', async () => {
    const user = userEvent.setup()
    
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })
    
    const mockSession = { user: { id: '123', email: 'test@example.com' } }
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: mockSession.user, session: mockSession },
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

  it('should show error when sign in fails', async () => {
    const user = userEvent.setup()
    
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })
    
    const signInError = new Error('Invalid credentials')
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
      expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials')
    })
  })

  it('should clear user state on sign out', async () => {
    const user = userEvent.setup()
    const mockSession = { user: { id: '123' }, access_token: 'token' }
    
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    })
    
    mockSupabase.auth.signOut.mockResolvedValue({ error: null })

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )
    })

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('authenticated')
    })

    await act(async () => {
      await user.click(screen.getByText('Sign Out'))
    })

    expect(mockSupabase.auth.signOut).toHaveBeenCalled()
  })

  it('should persist session on page reload', async () => {
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
    })
  })
})

describe('useAuth hook', () => {
  it('should throw error when used outside AuthProvider', () => {
    const TestComponent = () => {
      useAuth()
      return <div>Test</div>
    }

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useAuth must be used within an AuthProvider')
  })
})