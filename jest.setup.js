process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

import '@testing-library/jest-dom'

// Mock Next.js router
const mockRouter = {
  push: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
  replace: jest.fn(),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn(),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
}

jest.mock('next/router', () => ({
  useRouter: () => mockRouter,
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/',
}))

// Mock PostHog
jest.mock('posthog-js', () => ({
  init: jest.fn(),
  capture: jest.fn(),
  identify: jest.fn(),
  isFeatureEnabled: jest.fn(),
}))

// Mock browser image compression
jest.mock('browser-image-compression', () => {
  return jest.fn(() => Promise.resolve(new File(['compressed'], 'test.jpg', { type: 'image/jpeg' })))
})

// Global test setup
beforeEach(() => {
  jest.clearAllMocks()
  if (typeof window !== 'undefined') {
    localStorage.clear()
    sessionStorage.clear()
  }
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock URL.createObjectURL
if (typeof window !== 'undefined') {
  global.URL.createObjectURL = jest.fn(() => 'mocked-url')
  global.URL.revokeObjectURL = jest.fn()
}