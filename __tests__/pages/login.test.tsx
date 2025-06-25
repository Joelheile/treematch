import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/auth/login/page'

const mockSignIn = jest.fn()
const mockPush = jest.fn()
const mockToast = jest.fn()
const mockGet = jest.fn().mockReturnValue(null)

jest.mock('@/app/auth/AuthProvider', () => ({
  useAuth: () => ({
    user: null,
    session: null,
    loading: false,
    signIn: mockSignIn,
    signUp: jest.fn(),
    signOut: jest.fn(),
    signInWithGoogle: jest.fn(),
  }),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), refresh: jest.fn() }),
  useSearchParams: () => ({ get: mockGet }),
}))

jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}))

jest.mock('@/lib/onboarding-storage', () => ({
  OnboardingStorage: {
    exists: jest.fn().mockReturnValue(false),
    isExpired: jest.fn().mockReturnValue(true),
  },
}))

beforeEach(() => {
  jest.clearAllMocks()
  mockGet.mockReturnValue(null)
})

describe('LoginPage', () => {
  it('should validate Stanford email domain before sign in', async () => {
    const user = userEvent.setup()
    
    await act(async () => {
      render(<LoginPage />)
    })

    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await act(async () => {
      await user.type(emailInput, 'test@gmail.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)
    })

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Invalid Email Domain',
        description: 'Please use your Stanford email address (@stanford.edu)',
      })
    })
  })

  it('should sign in with valid Stanford email', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue(undefined)

    await act(async () => {
      render(<LoginPage />)
    })

    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await act(async () => {
      await user.type(emailInput, 'test@stanford.edu')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)
    })

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@stanford.edu', 'password123')
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('should display error when authentication fails', async () => {
    const user = userEvent.setup()
    const signInError = new Error('Invalid credentials')
    mockSignIn.mockRejectedValue(signInError)

    await act(async () => {
      render(<LoginPage />)
    })

    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await act(async () => {
      await user.type(emailInput, 'test@stanford.edu')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('should display URL error parameter', async () => {
    mockGet.mockReturnValue('Authentication failed')

    await act(async () => {
      render(<LoginPage />)
    })

    expect(screen.getByText('Authentication failed')).toBeInTheDocument()
  })
})