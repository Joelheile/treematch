import { useMutation } from '@tanstack/react-query'
import imageCompression from 'browser-image-compression'
import { supabase } from './client-ssr'

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
    return file
  }
}

const checkStorageBucket = async (bucketName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.storage.getBucket(bucketName)
    if (error) {
      return false
    }
    return true
  } catch (error) {
    return false
  }
}

const testImageUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch (error) {
    return false
  }
}

export const useUploadAvatar = () => {
  return useMutation<UploadAvatarResult, Error, UploadAvatarOptions>({
    mutationFn: async ({ file, userId }: UploadAvatarOptions) => {
      validateFile(file)
      
      const compressedFile = await compressImage(file)
      const safeName = sanitizeFileName(compressedFile.name)
      const timestamp = Date.now()
      
      let finalName: string
      let bucket: string
      
      if (userId) {
        // Always use avatars bucket for authenticated users with consistent naming
        finalName = `${userId}/avatar.jpg`
        bucket = 'avatars'
        
        // First, try to delete any existing avatar to ensure clean upload
        try {
          await supabase.storage.from(bucket).remove([finalName])
        } catch (error) {
          // Ignore errors - file might not exist
        }
      } else {
        finalName = `${timestamp}_${safeName}`
        bucket = 'temp-avatars'
      }
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(finalName, compressedFile, {
          cacheControl: '0',  // Disable caching to prevent browser cache issues
          upsert: true
        })
        
      if (error) {
        throw new Error(`Upload failed: ${error.message}`)
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(finalName)
      
      if (!publicUrl) {
        throw new Error('Failed to generate public URL for uploaded image')
      }
      
      // Add cache-busting timestamp to the URL for immediate display
      const cacheBustedUrl = `${publicUrl}?v=${timestamp}`
        
      return {
        url: cacheBustedUrl,
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

// Utility function to move an image from temp-avatars to avatars bucket
export const moveImageToAvatarsBucket = async (userId: string, tempImageUrl: string): Promise<string | null> => {
  try {
    // Extract the filename from the temp URL
    const tempPath = tempImageUrl.split('/temp-avatars/')[1]?.split('?')[0];
    if (!tempPath) return null;
    
    // Download the image from temp bucket
    const { data: imageData, error: downloadError } = await supabase.storage
      .from('temp-avatars')
      .download(tempPath);
    
    if (downloadError || !imageData) return null;
    
    const avatarPath = `${userId}/avatar.jpg`;
    
    // Upload to avatars bucket
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(avatarPath, imageData, { upsert: true });
    
    if (uploadError) return null;
    
    // Get the new public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(avatarPath);
    
    // Optionally clean up the temp file
    try {
      await supabase.storage.from('temp-avatars').remove([tempPath]);
    } catch (error) {
      // Ignore cleanup errors
    }
    
    return publicUrl;
  } catch (error) {
    console.error('Error moving image to avatars bucket:', error);
    return null;
  }
}; 