/*
  # Fix program visibility for all users

  1. Security Updates
    - Update RLS policies to allow all users to view programs
    - Keep admin-only restrictions for creating/editing programs
    - Ensure programs show up in the browse section for everyone

  2. Changes
    - Modify SELECT policy to allow public access
    - Keep INSERT/UPDATE/DELETE restricted to admins only
    - Add proper indexing for performance
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view programs" ON programs;
DROP POLICY IF EXISTS "Admins can manage programs" ON programs;

-- Create new policies with proper permissions
CREATE POLICY "Public can view programs"
  ON programs
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can insert programs"
  ON programs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.user_id = auth.uid() 
      AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can update programs"
  ON programs
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

CREATE POLICY "Admins can delete programs"
  ON programs
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
CREATE INDEX IF NOT EXISTS programs_created_by_idx ON programs(created_by);
CREATE INDEX IF NOT EXISTS programs_is_featured_idx ON programs(is_featured);
CREATE INDEX IF NOT EXISTS programs_created_at_idx ON programs(created_at DESC);