import { useMutation } from '@tanstack/react-query'
import imageCompression from 'browser-image-compression'
import { supabase } from './client'

interface UploadAvatarOptions {
  file: File
  userId?: string
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

const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 100)
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
    console.warn('Image compression failed, using original file:', error)
    return file
  }
}

const checkStorageBucket = async (bucketName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.storage.getBucket(bucketName)
    if (error) {
      console.error(`Bucket ${bucketName} check failed:`, error)
      return false
    }
    console.log(`Bucket ${bucketName} exists:`, data)
    return true
  } catch (error) {
    console.error(`Error checking bucket ${bucketName}:`, error)
    return false
  }
}

const testImageUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch (error) {
    console.error('Image URL test failed:', error)
    return false
  }
}

export const useUploadAvatar = () => {
  return useMutation<UploadAvatarResult, Error, UploadAvatarOptions>({
    mutationFn: async ({ file, userId }: UploadAvatarOptions) => {
      console.log('Starting upload with file:', file.name, 'userId:', userId);
      validateFile(file)
      
      const compressedFile = await compressImage(file)
      const safeName = sanitizeFileName(compressedFile.name)
      const timestamp = Date.now()
      
      let finalName: string
      let bucket: string
      
      if (userId) {
        finalName = `${userId}/avatar.jpg`
        bucket = 'avatars'
      } else {
        finalName = `${timestamp}_${safeName}`
        bucket = 'temp-avatars'
      }
      
      console.log('Uploading to bucket:', bucket, 'with path:', finalName);
      
      // Temporarily disable bucket check until buckets are created
      // const bucketExists = await checkStorageBucket(bucket)
      // if (!bucketExists) {
      //   throw new Error(`Storage bucket '${bucket}' does not exist or is not accessible`)
      // }
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(finalName, compressedFile, {
          cacheControl: '3600',
          upsert: true
        })
        
      if (error) {
        console.error('Upload error:', error);
        throw new Error(`Upload failed: ${error.message}`)
      }
      
      console.log('Upload successful, data:', data);
      
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(finalName)
        
      console.log('Generated public URL:', publicUrl);
      
      if (!publicUrl) {
        throw new Error('Failed to generate public URL for uploaded image')
      }
        
      return {
        url: publicUrl,
        path: finalName
      }
    }
  })
}

export const useUploadTempAvatar = () => {
  return useMutation<{ url: string; path: string }, Error, File>({
    mutationFn: async (file: File) => {
      validateFile(file)
      
      const safeName = sanitizeFileName(file.name)
      const timestamp = Date.now()
      const finalName = `${timestamp}_${safeName}`
      
      const { data, error } = await supabase.storage
        .from('temp-avatars')
        .upload(finalName, file, { 
          cacheControl: '3600', 
          upsert: true 
        })
        
      if (error) throw new Error(error.message)
      
      const { data: { publicUrl } } = supabase.storage
        .from('temp-avatars')
        .getPublicUrl(finalName)
        
      return { url: publicUrl, path: finalName }
    }
  })
} 