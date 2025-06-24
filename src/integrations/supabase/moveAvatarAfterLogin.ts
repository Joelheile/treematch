import { supabase } from './client'

export async function moveAvatarAfterLogin(tempPath: string, userId: string) {
  const newPath = `${userId}/avatar.jpg`
  // Try to move the file
  const { error: moveError } = await supabase.storage
    .from('temp-avatars')
    .move(tempPath, newPath)
  if (!moveError) {
    await supabase.storage.from('temp-avatars').remove([tempPath])
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(newPath)
    return publicUrl
  }
  // If move fails, download and re-upload
  const { data, error: downloadError } = await supabase.storage
    .from('temp-avatars')
    .download(tempPath)
  if (downloadError) throw new Error(downloadError.message)
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(newPath, data, { upsert: true })
  if (uploadError) throw new Error(uploadError.message)
  await supabase.storage.from('temp-avatars').remove([tempPath])
  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(newPath)
  return publicUrl
} 