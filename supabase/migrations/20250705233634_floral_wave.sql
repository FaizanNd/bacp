/*
  # Create storage buckets for files

  1. New Storage Buckets
    - `avatars` - For user profile pictures
    - `scripts` - For script files
    - `thumbnails` - For script thumbnails

  2. Security
    - Set up RLS policies for each bucket
    - Allow authenticated users to upload their own files
    - Allow public access to read files
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('avatars', 'avatars', true),
  ('scripts', 'scripts', true),
  ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for avatars bucket
CREATE POLICY "Users can upload their own avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Create policies for scripts bucket
CREATE POLICY "Users can upload their own script files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'scripts' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own script files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'scripts' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own script files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'scripts' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view script files" ON storage.objects
  FOR SELECT USING (bucket_id = 'scripts');

-- Create policies for thumbnails bucket
CREATE POLICY "Users can upload their own thumbnails" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'thumbnails' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own thumbnails" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'thumbnails' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own thumbnails" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'thumbnails' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view thumbnails" ON storage.objects
  FOR SELECT USING (bucket_id = 'thumbnails');