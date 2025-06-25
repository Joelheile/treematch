import { render, screen } from '@testing-library/react'
import { AuthGuard } from '@/components/AuthGuard'
import { useAuth } from '@/app/auth/AuthProvider'

jest.mock('@/app/auth/AuthProvider')

const mockUseAuth = jest.mocked(useAuth)

const TestChildren = () => <div data-testid="protected-content">Protected Content</div>

describe('AuthGuard', () => {
  beforeEach(() => {
    delete (window as any).location
    ;(window as any).location = { href: '' }
  })

  describe('when loading is true', () => {
    it('should show loading screen', () => {
      mockUseAuth.mockReturnValue({
        loading: true,
        user: null,
        session: null,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        signInWithGoogle: jest.fn(),
      })

      render(
        <AuthGuard>
          <TestChildren />
        </AuthGuard>
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    })

    it('should show TreePine icon in loading state', () => {
      mockUseAuth.mockReturnValue({
        loading: true,
        user: null,
        session: null,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        signInWithGoogle: jest.fn(),
      })

      render(
        <AuthGuard>
          <TestChildren />
        </AuthGuard>
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()
      const loadingDiv = screen.getByText('Loading...').parentElement
      expect(loadingDiv).toHaveClass('text-center space-y-4')
    })
  })

  describe('when user is not authenticated', () => {
    it('should redirect to login page', () => {
      mockUseAuth.mockReturnValue({
        loading: false,
        user: null,
        session: null,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        signInWithGoogle: jest.fn(),
      })

      render(
        <AuthGuard>
          <TestChildren />
        </AuthGuard>
      )

      expect(window.location.href).toBe('/auth/login')
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    })

    it('should return null when redirecting', () => {
      mockUseAuth.mockReturnValue({
        loading: false,
        user: null,
        session: null,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        signInWithGoogle: jest.fn(),
      })

      const { container } = render(
        <AuthGuard>
          <TestChildren />
        </AuthGuard>
      )

      expect(container.firstChild).toBeNull()
    })
  })

  describe('when user is authenticated', () => {
    it('should render children', () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      mockUseAuth.mockReturnValue({
        loading: false,
        user: mockUser,
        session: { user: mockUser },
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        signInWithGoogle: jest.fn(),
      })

      render(
        <AuthGuard>
          <TestChildren />
        </AuthGuard>
      )

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('should not redirect when user exists', () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      mockUseAuth.mockReturnValue({
        loading: false,
        user: mockUser,
        session: { user: mockUser },
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        signInWithGoogle: jest.fn(),
      })

      render(
        <AuthGuard>
          <TestChildren />
        </AuthGuard>
      )

      expect(window.location.href).toBe('')
    })
  })

  describe('when window is undefined (SSR)', () => {
    it('should not attempt redirect during SSR', () => {
      const originalWindow = global.window
      ;(global as any).window = undefined

      mockUseAuth.mockReturnValue({
        loading: false,
        user: null,
        session: null,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        signInWithGoogle: jest.fn(),
      })

      const { container } = render(
        <AuthGuard>
          <TestChildren />
        </AuthGuard>
      )

      expect(container.firstChild).toBeNull()

      global.window = originalWindow
    })
  })
})