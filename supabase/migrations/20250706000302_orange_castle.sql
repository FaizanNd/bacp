/*
  # Fix user signup RLS policies

  1. Security Updates
    - Add policy to allow service role to insert users during signup
    - Modify existing policies to work with the auth system
    - Ensure users can still manage their own profiles

  2. Changes
    - Add policy for service role INSERT operations
    - Update existing INSERT policy to be more permissive during signup
    - Keep existing SELECT and UPDATE policies intact
*/

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

-- Create a new INSERT policy that allows both authenticated users and the service role
CREATE POLICY "Allow user profile creation"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (
    -- Allow if user is authenticated and inserting their own profile
    (auth.uid() = user_id) OR
    -- Allow if this is the service role (for automatic user creation during signup)
    (auth.role() = 'service_role') OR
    -- Allow if this is the supabase_auth_admin role (for triggers)
    (auth.role() = 'supabase_auth_admin')
  );

-- Ensure the SELECT policy allows users to view their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
CREATE POLICY "Users can view their own profile"
  ON users
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

-- Keep the existing UPDATE policy for AV3 admin functionality
-- (This should already exist based on the schema)