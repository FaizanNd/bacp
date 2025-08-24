/*
  # Implement Owner and Admin Role Hierarchy

  1. Role Structure
    - Owner (AV3): Can do everything admins can do + promote users to admin + post owner content
    - Admins: Can verify/delete scripts, moderate comments, but cannot promote users or post owner content
    - Users: Regular users with basic permissions

  2. Security Updates
    - Update AV3 user to use sircats42@gmail.com
    - Create proper role-based policies
    - Ensure only AV3 can promote users to admin
    - Ensure only AV3 can post to owner posts section

  3. Database Changes
    - Add owner-specific policies
    - Update existing admin policies
    - Ensure proper permission separation
*/

-- First, update AV3's email if the user exists
UPDATE users 
SET email = 'sircats42@gmail.com'
WHERE username = 'AV3';

-- Also update in auth.users if it exists
UPDATE auth.users 
SET email = 'sircats42@gmail.com'
WHERE email IN (
  SELECT email FROM users WHERE username = 'AV3'
);

-- Ensure AV3 is marked as admin
UPDATE users 
SET is_admin = true 
WHERE username = 'AV3';

-- Drop existing promotion policy and create owner-specific one
DROP POLICY IF EXISTS "AV3 can promote users" ON users;
CREATE POLICY "Owner can promote users to admin"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    -- Only AV3 (the owner) can promote users
    (SELECT username FROM users WHERE user_id = auth.uid()) = 'AV3'
  )
  WITH CHECK (
    -- Only AV3 can make these changes
    (SELECT username FROM users WHERE user_id = auth.uid()) = 'AV3'
  );

-- Update programs policies to be owner-specific
DROP POLICY IF EXISTS "Admins can insert programs" ON programs;
DROP POLICY IF EXISTS "Admins can update programs" ON programs;
DROP POLICY IF EXISTS "Admins can delete programs" ON programs;

-- Only the owner (AV3) can manage programs in the owner posts section
CREATE POLICY "Owner can insert programs"
  ON programs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT username FROM users WHERE user_id = auth.uid()) = 'AV3'
  );

CREATE POLICY "Owner can update programs"
  ON programs
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT username FROM users WHERE user_id = auth.uid()) = 'AV3'
  )
  WITH CHECK (
    (SELECT username FROM users WHERE user_id = auth.uid()) = 'AV3'
  );

CREATE POLICY "Owner can delete programs"
  ON programs
  FOR DELETE
  TO authenticated
  USING (
    (SELECT username FROM users WHERE user_id = auth.uid()) = 'AV3'
  );

-- Update script verification policies to allow both owner and admins
DROP POLICY IF EXISTS "AV3 can verify scripts" ON scripts;
CREATE POLICY "Owner and admins can verify scripts"
  ON scripts
  FOR UPDATE
  TO authenticated
  USING (
    -- Allow both owner (AV3) and regular admins to verify scripts
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

-- Allow admins to delete scripts (but not create them - users create scripts)
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

-- Update comment moderation to allow all admins (including owner)
DROP POLICY IF EXISTS "Admins can moderate comments" ON comments;
CREATE POLICY "Admins can moderate all comments"
  ON comments
  FOR ALL
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

-- Add a function to check if user is the owner (AV3)
CREATE OR REPLACE FUNCTION is_owner()
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT username FROM users 
    WHERE user_id = auth.uid()
  ) = 'AV3';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a function to check if user is admin (including owner)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE user_id = auth.uid() 
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add download_url field to programs if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'programs' AND column_name = 'download_url'
  ) THEN
    ALTER TABLE programs ADD COLUMN download_url text;
  END IF;
END $$;

-- Add view_count to scripts if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'scripts' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE scripts ADD COLUMN view_count integer DEFAULT 0;
  END IF;
END $$;