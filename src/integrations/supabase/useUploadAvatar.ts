import { useMutation } from '@tanstack/react-query'
import imageCompression from 'browser-image-compression'
import { supabase } from './client'

interface UploadAvatarOptions {
  file: File
  userId: string
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
    console.warn('Image compression failed, using original file:', error)
    return file
  }
}

export const useUploadAvatar = () => {
  return useMutation<UploadAvatarResult, Error, UploadAvatarOptions>({
    mutationFn: async ({ file, userId }: UploadAvatarOptions) => {
      const compressedFile = await compressImage(file)
      
      const fileExt = compressedFile.name.split('.').pop() || 'jpg'
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { data, error } = await supabase.storage
        .from('avatar')
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        throw new Error(`Upload failed: ${error.message}`)
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatar')
        .getPublicUrl(filePath)

      return {
        url: publicUrl,
        path: filePath
      }
    }
  })
} 