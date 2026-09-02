-- Fix storage buckets for image uploads
-- Run this in your Supabase SQL Editor

-- Create storage buckets for avatars
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('avatars', 'avatars', true),
  ('temp-avatars', 'temp-avatars', true)
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public Access Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Temp Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload temp avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update temp avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete temp avatars" ON storage.objects;

-- Create storage policies for avatars bucket
CREATE POLICY "Public Access Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their own avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own avatars" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- temp-avatars is read-only. It only holds profile images from before uploads moved behind login.
CREATE POLICY "Public Access Temp Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'temp-avatars');
