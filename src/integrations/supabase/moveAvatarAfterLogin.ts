import { createClient } from './client-ssr'

export async function moveAvatarAfterLogin(tempPath: string, userId: string) {
  const supabase = createClient()
  const newPath = `${userId}/avatar.jpg`
  
  try {
    const { data, error: downloadError } = await supabase.storage
      .from('temp-avatars')
      .download(tempPath)
    
    if (downloadError) {
      return null
    }
    
    if (!data) {
      return null
    }
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(newPath, data, { upsert: true })
    
    if (uploadError) {
      return null
    }
    
    const { error: removeError } = await supabase.storage
      .from('temp-avatars')
      .remove([tempPath])
    
    if (removeError) {
      // Failed to remove temp avatar, but upload was successful
    }
    
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(newPath)
    return publicUrl
  } catch (error) {
    return null
  }
} 