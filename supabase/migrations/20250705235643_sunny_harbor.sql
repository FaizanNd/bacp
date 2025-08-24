/*
  # Add INSERT policy for users table

  1. Security
    - Add policy to allow authenticated users to insert their own user record
    - This enables the signup process to work properly by allowing new user creation

  The policy ensures users can only insert a record with their own user_id (from auth.uid()).
*/

CREATE POLICY "Users can insert their own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);