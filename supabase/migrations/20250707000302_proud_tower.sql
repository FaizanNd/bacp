/*
  # Fix admin privileges for AV3 user

  1. Updates
    - Set AV3 user as admin if exists
    - Add policy to allow AV3 to promote other users

  2. Security
    - Update existing policies to work with admin system
*/

-- Update AV3 to be admin if the user exists
UPDATE users 
SET is_admin = true 
WHERE username = 'AV3';

-- Ensure the AV3 promotion policy exists
DROP POLICY IF EXISTS "AV3 can promote users" ON users;
CREATE POLICY "AV3 can promote users"
  ON users
  FOR UPDATE
  TO public
  USING (
    (SELECT username FROM users WHERE user_id = auth.uid()) = 'AV3'
  );