import { createClient } from './client-ssr'

export async function moveAvatarAfterLogin(tempPath: string, userId: string) {
  const supabase = createClient()
  const newPath = `${userId}/avatar.jpg`
  
  try {
    console.log('Moving avatar from temp path:', tempPath, 'to new path:', newPath)
    
    const { data, error: downloadError } = await supabase.storage
      .from('temp-avatars')
      .download(tempPath)
    
    if (downloadError) {
      console.error('Failed to download temp avatar:', downloadError)
      return null
    }
    
    if (!data) {
      console.error('No data received from temp avatar download')
      return null
    }
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(newPath, data, { upsert: true })
    
    if (uploadError) {
      console.error('Failed to upload avatar:', uploadError)
      return null
    }
    
    const { error: removeError } = await supabase.storage
      .from('temp-avatars')
      .remove([tempPath])
    
    if (removeError) {
      console.warn('Failed to remove temp avatar:', removeError)
    }
    
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(newPath)
    console.log('Successfully moved avatar to:', publicUrl)
    return publicUrl
  } catch (error) {
    console.error('Error moving avatar:', error)
    return null
  }
} 