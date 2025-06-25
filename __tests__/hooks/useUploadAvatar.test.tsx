import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useUploadAvatar, useUploadTempAvatar } from '@/integrations/supabase/useUploadAvatar'
import { supabase } from '@/integrations/supabase/client'
import imageCompression from 'browser-image-compression'

jest.mock('@/integrations/supabase/client')
jest.mock('browser-image-compression')

const mockSupabase = {
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(),
      getPublicUrl: jest.fn(),
    })),
  },
}

const mockImageCompression = jest.mocked(imageCompression)

beforeEach(() => {
  ;(supabase as any).storage = mockSupabase.storage
  console.log = jest.fn()
})

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

describe('useUploadAvatar', () => {
  describe('when uploading avatar without userId (temp storage)', () => {
    it('should compress and upload image to temp-avatars bucket', async () => {
      const mockFile = new File(['test content'], 'test-image.jpg', { type: 'image/jpeg' })
      const compressedFile = new File(['compressed content'], 'test-image.jpg', { type: 'image/jpeg' })
      
      mockImageCompression.mockResolvedValue(compressedFile)

      const uploadMock = jest.fn().mockResolvedValue({
        data: { path: 'test_image.jpg' },
        error: null,
      })

      const getPublicUrlMock = jest.fn().mockReturnValue({
        data: { publicUrl: 'https://example.com/temp-avatars/test_image.jpg' },
      })

      mockSupabase.storage.from.mockReturnValue({
        upload: uploadMock,
        getPublicUrl: getPublicUrlMock,
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useUploadAvatar(), { wrapper })

      result.current.mutate({ file: mockFile })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockImageCompression).toHaveBeenCalledWith(mockFile, {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: false,
        fileType: 'image/jpeg',
      })

      expect(mockSupabase.storage.from).toHaveBeenCalledWith('temp-avatars')
      expect(uploadMock).toHaveBeenCalledWith('test_image.jpg', compressedFile, {
        cacheControl: '3600',
        upsert: true,
      })

      expect(result.current.data).toEqual({
        url: 'https://example.com/temp-avatars/test_image.jpg',
        path: 'test_image.jpg',
      })
    })
  })

  describe('when uploading avatar with userId (permanent storage)', () => {
    it('should compress and upload image to avatars bucket with user path', async () => {
      const mockFile = new File(['test content'], 'test-image.jpg', { type: 'image/jpeg' })
      const compressedFile = new File(['compressed content'], 'test-image.jpg', { type: 'image/jpeg' })
      const userId = 'user123'
      
      mockImageCompression.mockResolvedValue(compressedFile)

      const uploadMock = jest.fn().mockResolvedValue({
        data: { path: `${userId}/avatar.jpg` },
        error: null,
      })

      const getPublicUrlMock = jest.fn().mockReturnValue({
        data: { publicUrl: `https://example.com/avatars/${userId}/avatar.jpg` },
      })

      mockSupabase.storage.from.mockReturnValue({
        upload: uploadMock,
        getPublicUrl: getPublicUrlMock,
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useUploadAvatar(), { wrapper })

      result.current.mutate({ file: mockFile, userId })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockImageCompression).toHaveBeenCalledWith(mockFile, {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: false,
        fileType: 'image/jpeg',
      })

      expect(mockSupabase.storage.from).toHaveBeenCalledWith('avatars')
      expect(uploadMock).toHaveBeenCalledWith(`${userId}/avatar.jpg`, compressedFile, {
        cacheControl: '3600',
        upsert: true,
      })

      expect(result.current.data).toEqual({
        url: `https://example.com/avatars/${userId}/avatar.jpg`,
        path: `${userId}/avatar.jpg`,
      })
    })
  })

  describe('when file has special characters in name', () => {
    it('should sanitize file name with special characters', async () => {
      const mockFile = new File(['content'], 'test@file#name.jpg', { type: 'image/jpeg' })
      const compressedFile = new File(['compressed'], 'test@file#name.jpg', { type: 'image/jpeg' })

      mockImageCompression.mockResolvedValue(compressedFile)

      const uploadMock = jest.fn().mockResolvedValue({
        data: { path: 'test_file_name.jpg' },
        error: null,
      })

      const getPublicUrlMock = jest.fn().mockReturnValue({
        data: { publicUrl: 'https://example.com/temp-avatars/test_file_name.jpg' },
      })

      mockSupabase.storage.from.mockReturnValue({
        upload: uploadMock,
        getPublicUrl: getPublicUrlMock,
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useUploadAvatar(), { wrapper })

      result.current.mutate({ file: mockFile })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(uploadMock).toHaveBeenCalledWith('test_file_name.jpg', compressedFile, {
        cacheControl: '3600',
        upsert: true,
      })
    })

    it('should use original file when compression fails', async () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      const compressionError = new Error('Compression failed')

      mockImageCompression.mockRejectedValue(compressionError)

      const uploadMock = jest.fn().mockResolvedValue({
        data: { path: 'test.jpg' },
        error: null,
      })

      const getPublicUrlMock = jest.fn().mockReturnValue({
        data: { publicUrl: 'https://example.com/temp-avatars/test.jpg' },
      })

      mockSupabase.storage.from.mockReturnValue({
        upload: uploadMock,
        getPublicUrl: getPublicUrlMock,
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useUploadAvatar(), { wrapper })

      result.current.mutate({ file: mockFile })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(uploadMock).toHaveBeenCalledWith('test.jpg', mockFile, {
        cacheControl: '3600',
        upsert: true,
      })
    })
  })

  describe('when upload fails', () => {
    it('should throw error with upload message', async () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      const compressedFile = new File(['compressed'], 'test.jpg', { type: 'image/jpeg' })

      mockImageCompression.mockResolvedValue(compressedFile)

      const uploadError = { message: 'Storage quota exceeded' }
      const uploadMock = jest.fn().mockResolvedValue({
        data: null,
        error: uploadError,
      })

      mockSupabase.storage.from.mockReturnValue({
        upload: uploadMock,
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useUploadAvatar(), { wrapper })

      result.current.mutate({ file: mockFile })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error?.message).toBe('Upload failed: Storage quota exceeded')
    })
  })
})

describe('useUploadTempAvatar', () => {
  describe('when uploading temp avatar successfully', () => {
    it('should upload file without compression', async () => {
      const mockFile = new File(['content'], 'temp-avatar.jpg', { type: 'image/jpeg' })

      const uploadMock = jest.fn().mockResolvedValue({
        data: { path: 'temp_avatar.jpg' },
        error: null,
      })

      const getPublicUrlMock = jest.fn().mockReturnValue({
        data: { publicUrl: 'https://example.com/temp-avatars/temp_avatar.jpg' },
      })

      mockSupabase.storage.from.mockReturnValue({
        upload: uploadMock,
        getPublicUrl: getPublicUrlMock,
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useUploadTempAvatar(), { wrapper })

      result.current.mutate(mockFile)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockImageCompression).not.toHaveBeenCalled()
      expect(uploadMock).toHaveBeenCalledWith('temp_avatar.jpg', mockFile, {
        cacheControl: '3600',
        upsert: true,
      })

      expect(result.current.data).toEqual({
        url: 'https://example.com/temp-avatars/temp_avatar.jpg',
        path: 'temp_avatar.jpg',
      })
    })

    it('should sanitize temp avatar file name', async () => {
      const mockFile = new File(['content'], 'temp@avatar#.jpg', { type: 'image/jpeg' })

      const uploadMock = jest.fn().mockResolvedValue({
        data: { path: 'temp_avatar_.jpg' },
        error: null,
      })

      const getPublicUrlMock = jest.fn().mockReturnValue({
        data: { publicUrl: 'https://example.com/temp-avatars/temp_avatar_.jpg' },
      })

      mockSupabase.storage.from.mockReturnValue({
        upload: uploadMock,
        getPublicUrl: getPublicUrlMock,
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useUploadTempAvatar(), { wrapper })

      result.current.mutate(mockFile)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(uploadMock).toHaveBeenCalledWith('temp_avatar_.jpg', mockFile, {
        cacheControl: '3600',
        upsert: true,
      })
    })
  })

  describe('when temp upload fails', () => {
    it('should throw error with message', async () => {
      const mockFile = new File(['content'], 'temp.jpg', { type: 'image/jpeg' })
      const uploadError = { message: 'Network error' }

      const uploadMock = jest.fn().mockResolvedValue({
        data: null,
        error: uploadError,
      })

      mockSupabase.storage.from.mockReturnValue({
        upload: uploadMock,
      })

      const wrapper = createWrapper()
      const { result } = renderHook(() => useUploadTempAvatar(), { wrapper })

      result.current.mutate(mockFile)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error?.message).toBe('Network error')
    })
  })
})