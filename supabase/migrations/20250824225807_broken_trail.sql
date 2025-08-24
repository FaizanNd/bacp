/*
  # Fix user management and admin privileges

  1. Security Updates
    - Ensure AV3 is properly set as admin with correct email
    - Add policies for user management
    - Fix admin promotion system

  2. Changes
    - Update AV3 user data
    - Add user management policies
    - Ensure proper role hierarchy
*/

-- Update AV3 user to have correct email and admin status
UPDATE users 
SET 
  email = 'sircats42@gmail.com',
  is_admin = true
WHERE username = 'AV3';

-- Also update in auth.users if the user exists
UPDATE auth.users 
SET email = 'sircats42@gmail.com'
WHERE id IN (
  SELECT user_id FROM users WHERE username = 'AV3'
);

-- Add policy for users to view other users (needed for user management)
DROP POLICY IF EXISTS "Users can view other users" ON users;
CREATE POLICY "Users can view other users"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Add policy for owner to promote users
DROP POLICY IF EXISTS "Owner can promote users to admin" ON users;
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

-- Ensure users can still update their own profiles
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add function to get all users (for user management)
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (
  user_id uuid,
  username text,
  email text,
  profile_picture_url text,
  is_admin boolean,
  created_at timestamptz
) AS $$
BEGIN
  -- Only allow AV3 to call this function
  IF (SELECT u.username FROM users u WHERE u.user_id = auth.uid()) != 'AV3' THEN
    RAISE EXCEPTION 'Access denied: Only the owner can view all users';
  END IF;

  RETURN QUERY
  SELECT 
    u.user_id,
    u.username,
    u.email,
    u.profile_picture_url,
    u.is_admin,
    u.created_at
  FROM users u
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;