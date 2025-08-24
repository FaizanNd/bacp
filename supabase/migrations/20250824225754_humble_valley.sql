/*
  # Fix script upload and visibility policies

  1. Security Updates
    - Fix script upload policies to allow authenticated users to upload
    - Ensure proper RLS policies for script visibility
    - Add missing columns and constraints

  2. Changes
    - Allow authenticated users to insert scripts
    - Allow public to view all scripts
    - Allow admins to verify/delete scripts
    - Add proper indexes for performance
*/

-- Ensure scripts table has all required columns
DO $$
BEGIN
  -- Add view_count if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scripts' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE scripts ADD COLUMN view_count integer DEFAULT 0;
  END IF;

  -- Add thumbnail_url if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scripts' AND column_name = 'thumbnail_url'
  ) THEN
    ALTER TABLE scripts ADD COLUMN thumbnail_url text;
  END IF;

  -- Add file_url if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scripts' AND column_name = 'file_url'
  ) THEN
    ALTER TABLE scripts ADD COLUMN file_url text;
  END IF;

  -- Add script_content if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scripts' AND column_name = 'script_content'
  ) THEN
    ALTER TABLE scripts ADD COLUMN script_content text;
  END IF;
END $$;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Anyone can view scripts" ON scripts;
DROP POLICY IF EXISTS "Users can upload scripts" ON scripts;
DROP POLICY IF EXISTS "Users can update their own scripts" ON scripts;
DROP POLICY IF EXISTS "Admins can verify scripts" ON scripts;
DROP POLICY IF EXISTS "Owner and admins can verify scripts" ON scripts;
DROP POLICY IF EXISTS "Admins can delete scripts" ON scripts;

-- Create comprehensive script policies
CREATE POLICY "Public can view all scripts"
  ON scripts
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can upload scripts"
  ON scripts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scripts"
  ON scripts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can verify and moderate scripts"
  ON scripts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.user_id = auth.uid() 
      AND users.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.user_id = auth.uid() 
      AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can delete scripts"
  ON scripts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.user_id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS scripts_user_id_idx ON scripts(user_id);
CREATE INDEX IF NOT EXISTS scripts_is_verified_idx ON scripts(is_verified);
CREATE INDEX IF NOT EXISTS scripts_created_at_idx ON scripts(created_at DESC);
CREATE INDEX IF NOT EXISTS scripts_view_count_idx ON scripts(view_count DESC);

-- Ensure the scripts table exists with proper structure
CREATE TABLE IF NOT EXISTS scripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  script_content text,
  file_url text,
  thumbnail_url text,
  is_verified boolean DEFAULT false,
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;