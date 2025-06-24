import { createClient } from './client-ssr'

export async function moveAvatarAfterLogin(tempPath: string, userId: string) {
  const supabase = createClient()
  const newPath = `${userId}/avatar.jpg`
  
  try {
    const { data, error: downloadError } = await supabase.storage
      .from('temp-avatars')
      .download(tempPath)
    
    if (downloadError) {
      console.error('Failed to download temp avatar:', downloadError)
      return null
    }
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(newPath, data, { upsert: true })
    
    if (uploadError) {
      console.error('Failed to upload avatar:', uploadError)
      return null
    }
    
    await supabase.storage.from('temp-avatars').remove([tempPath])
    
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(newPath)
    return publicUrl
  } catch (error) {
    console.error('Error moving avatar:', error)
    return null
  }
} 