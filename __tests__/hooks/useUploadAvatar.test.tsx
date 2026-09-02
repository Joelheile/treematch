import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useUploadAvatar } from '@/integrations/supabase/useUploadAvatar'
import { supabase } from '@/integrations/supabase/client-ssr'
import imageCompression from 'browser-image-compression'

jest.mock('@/integrations/supabase/client-ssr')
jest.mock('browser-image-compression')

const uploadMock = jest.fn()
const getPublicUrlMock = jest.fn()
const storageFromMock = jest.fn(() => ({ upload: uploadMock, getPublicUrl: getPublicUrlMock }))
const mockImageCompression = jest.mocked(imageCompression)

beforeEach(() => {
  jest.clearAllMocks()
  Object.assign(supabase, { storage: { from: storageFromMock } })
  uploadMock.mockResolvedValue({ data: { path: 'user123/avatar.jpg' }, error: null })
  getPublicUrlMock.mockReturnValue({ data: { publicUrl: 'https://example.com/avatars/user123/avatar.jpg' } })
})

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const jpeg = (name: string) => new File(['image'], name, { type: 'image/jpeg' })

describe('useUploadAvatar', () => {
  it('compresses and uploads to avatars/<userId>/avatar.jpg', async () => {
    const compressed = jpeg('compressed.jpg')
    mockImageCompression.mockResolvedValue(compressed)

    const { result } = renderHook(() => useUploadAvatar(), { wrapper: createWrapper() })
    result.current.mutate({ file: jpeg('photo.jpg'), userId: 'user123' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(storageFromMock).toHaveBeenCalledWith('avatars')
    expect(uploadMock).toHaveBeenCalledWith('user123/avatar.jpg', compressed, {
      cacheControl: '0',
      upsert: true,
    })
    expect(result.current.data).toEqual({
      url: expect.stringMatching(/^https:\/\/example\.com\/avatars\/user123\/avatar\.jpg\?v=\d+$/),
      path: 'user123/avatar.jpg',
    })
  })

  it('uploads the original file when compression fails', async () => {
    const original = jpeg('photo.jpg')
    mockImageCompression.mockRejectedValue(new Error('compression failed'))

    const { result } = renderHook(() => useUploadAvatar(), { wrapper: createWrapper() })
    result.current.mutate({ file: original, userId: 'user123' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(uploadMock).toHaveBeenCalledWith('user123/avatar.jpg', original, {
      cacheControl: '0',
      upsert: true,
    })
  })

  it('rejects files that are not images', async () => {
    const { result } = renderHook(() => useUploadAvatar(), { wrapper: createWrapper() })
    result.current.mutate({ file: new File(['x'], 'notes.txt', { type: 'text/plain' }), userId: 'user123' })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toMatch(/valid image file/)
    expect(uploadMock).not.toHaveBeenCalled()
  })

  it('surfaces the storage error message', async () => {
    mockImageCompression.mockResolvedValue(jpeg('photo.jpg'))
    uploadMock.mockResolvedValue({ data: null, error: { message: 'Storage quota exceeded' } })

    const { result } = renderHook(() => useUploadAvatar(), { wrapper: createWrapper() })
    result.current.mutate({ file: jpeg('photo.jpg'), userId: 'user123' })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe('Upload failed: Storage quota exceeded')
  })
})
