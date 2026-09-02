import { useMutation } from '@tanstack/react-query'
import imageCompression from 'browser-image-compression'
import { supabase } from './client-ssr'

interface UploadAvatarOptions {
  file: File
  userId: string
}

interface UploadAvatarResult {
  url: string
  path: string
}

const validateFile = (file: File): void => {
  const maxSize = 5 * 1024 * 1024
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  
  if (file.size > maxSize) {
    throw new Error('File size must be less than 5MB')
  }
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Please upload a valid image file (JPG, PNG, GIF, or WebP)')
  }
  
  const fileName = file.name.toLowerCase()
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext))
  
  if (!hasValidExtension) {
    throw new Error('Invalid file extension')
  }
}

const compressImage = async (file: File): Promise<File> => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 800,
    useWebWorker: false,
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
    mutationFn: async ({ file, userId }: UploadAvatarOptions) => {
      validateFile(file)

      const compressedFile = await compressImage(file)
      const path = `${userId}/avatar.jpg`

      const { error } = await supabase.storage
        .from('avatars')
        .upload(path, compressedFile, { cacheControl: '0', upsert: true })

      if (error) {
        throw new Error(`Upload failed: ${error.message}`)
      }

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)

      return { url: `${publicUrl}?v=${Date.now()}`, path }
    },
  })
}
