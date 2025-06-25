import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/auth/login/page'

// Mock the useAuth hook
const mockSignIn = jest.fn()
const mockSignInWithGoogle = jest.fn()
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
    signInWithGoogle: mockSignInWithGoogle,
  }),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: mockGet,
  }),
}))

jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}))

// Mock OnboardingStorage
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
  describe('when page renders', () => {
    it('should display login form elements', async () => {
      await act(async () => {
        render(<LoginPage />)
      })

      expect(screen.getByText('Welcome to TreeMatch')).toBeInTheDocument()
      expect(screen.getByText('Connect with Stanford students and build together')).toBeInTheDocument()
      expect(screen.getByLabelText('Email address')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('should display navigation links', async () => {
      await act(async () => {
        render(<LoginPage />)
      })

      expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute('href', '/auth/signup')
      expect(screen.getByRole('link', { name: /start with our quick setup/i })).toHaveAttribute('href', '/onboarding')
      expect(screen.getByRole('link', { name: /forgot your password/i })).toHaveAttribute('href', '/auth/reset-password')
    })

    it('should have proper form structure', async () => {
      await act(async () => {
        render(<LoginPage />)
      })

      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')

      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toHaveAttribute('placeholder', 'your.email@stanford.edu')
      expect(emailInput).toBeRequired()

      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(passwordInput).toHaveAttribute('placeholder', 'Enter your password')
      expect(passwordInput).toBeRequired()
    })
  })

  describe('when URL contains error parameter', () => {
    it('should display error from URL', async () => {
      mockGet.mockReturnValue('Authentication failed')

      await act(async () => {
        render(<LoginPage />)
      })

      expect(screen.getByText('Authentication failed')).toBeInTheDocument()
    })
  })

  describe('when form is submitted', () => {
    it('should validate Stanford email domain', async () => {
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
      })
      
      await act(async () => {
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

    it('should allow Stanford email domains', async () => {
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
      })
      
      await act(async () => {
        await user.click(submitButton)
      })

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@stanford.edu', 'password123')
      })
    })

    it('should show loading state during sign in', async () => {
      const user = userEvent.setup()
      let resolveSignIn: () => void
      mockSignIn.mockImplementation(() => new Promise(resolve => {
        resolveSignIn = resolve
      }))

      await act(async () => {
        render(<LoginPage />)
      })

      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await act(async () => {
        await user.type(emailInput, 'test@stanford.edu')
        await user.type(passwordInput, 'password123')
      })
      
      await act(async () => {
        await user.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Signing in...')).toBeInTheDocument()
        expect(submitButton).toBeDisabled()
      })

      // Resolve the promise to clean up
      await act(async () => {
        resolveSignIn!()
      })
    })

    it('should redirect to home page after successful login', async () => {
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
      })
      
      await act(async () => {
        await user.click(submitButton)
      })

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/')
      })
    })

    it('should display error when sign in fails', async () => {
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
      })
      
      await act(async () => {
        await user.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })
    })
  })

  describe('form validation', () => {
    it('should prevent submission with empty email', async () => {
      const user = userEvent.setup()
      
      await act(async () => {
        render(<LoginPage />)
      })

      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await act(async () => {
        await user.type(passwordInput, 'password123')
      })
      
      await act(async () => {
        await user.click(submitButton)
      })

      const emailInput = screen.getByLabelText('Email address')
      expect(emailInput).toBeInvalid()
    })

    it('should prevent submission with empty password', async () => {
      const user = userEvent.setup()
      
      await act(async () => {
        render(<LoginPage />)
      })

      const emailInput = screen.getByLabelText('Email address')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await act(async () => {
        await user.type(emailInput, 'test@stanford.edu')
      })
      
      await act(async () => {
        await user.click(submitButton)
      })

      const passwordInput = screen.getByLabelText('Password')
      expect(passwordInput).toBeInvalid()
    })
  })

  describe('accessibility', () => {
    it('should have proper form labels', async () => {
      await act(async () => {
        render(<LoginPage />)
      })

      expect(screen.getByLabelText('Email address')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
    })

    it('should have proper heading structure', async () => {
      await act(async () => {
        render(<LoginPage />)
      })

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveTextContent('Welcome to TreeMatch')
    })
  })
})