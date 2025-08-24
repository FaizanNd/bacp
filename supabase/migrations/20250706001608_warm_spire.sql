/*
  # Create user profile trigger for authentication

  1. New Functions
    - `handle_new_user()` - Creates a user profile in the public.users table when a new auth user is created
  
  2. New Triggers
    - `on_auth_user_created` - Triggers the handle_new_user function on INSERT to auth.users
  
  3. Security
    - Function runs with security definer privileges to bypass RLS
    - Ensures user profile is created with proper defaults
  
  This migration fixes the "Database error saving new user" issue by automatically creating
  a corresponding profile in the users table whenever someone signs up through Supabase Auth.
*/

-- Create the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (user_id, username, email, is_admin, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    NEW.email,
    false,
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();