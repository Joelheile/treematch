import { useMutation } from '@tanstack/react-query'
import imageCompression from 'browser-image-compression'
import { supabase } from './client'

interface UploadAvatarOptions {
  file: File
}

interface UploadAvatarResult {
  url: string
  path: string
}

const compressImage = async (file: File): Promise<File> => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 800,
    useWebWorker: true,
    fileType: 'image/jpeg',
  }

  try {
    return await imageCompression(file, options)
  } catch (error) {
    return file
  }
}

export const useUploadAvatar = () => {
  return useMutation<UploadAvatarResult, Error, UploadAvatarOptions>({
    mutationFn: async ({ file }: UploadAvatarOptions) => {
      const compressedFile = await compressImage(file)
      const fileExt = compressedFile.name.split('.').pop() || 'jpg'
      const fileName = `${crypto.randomUUID()}.${fileExt}`
      const { data, error } = await supabase.storage
        .from('temp-avatars')
        .upload(fileName, compressedFile, {
          cacheControl: '3600',
          upsert: true
        })
      if (error) {
        throw new Error(`Upload failed: ${error.message}`)
      }
      const { data: { publicUrl } } = supabase.storage
        .from('temp-avatars')
        .getPublicUrl(fileName)
      return {
        url: publicUrl,
        path: fileName
      }
    }
  })
}

export const useUploadTempAvatar = () => {
  return useMutation<{ url: string; path: string }, Error, File>({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop() || 'jpg'
      const fileName = `${crypto.randomUUID()}.${fileExt}`
      const { data, error } = await supabase.storage
        .from('temp-avatars')
        .upload(fileName, file, { cacheControl: '3600', upsert: true })
      if (error) throw new Error(error.message)
      const { data: { publicUrl } } = supabase.storage
        .from('temp-avatars')
        .getPublicUrl(fileName)
      return { url: publicUrl, path: fileName }
    }
  })
} 