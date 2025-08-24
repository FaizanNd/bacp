/*
  # Create likes table

  1. New Tables
    - `likes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `script_id` (uuid, references scripts, optional)
      - `program_id` (uuid, references programs, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `likes` table
    - Add policies for users to manage their own likes
    - Add policies for public to view like counts

  3. Constraints
    - Ensure either script_id or program_id is set (not both)
    - Unique constraint on user_id + script_id/program_id combinations
*/

CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  script_id uuid REFERENCES scripts(id) ON DELETE CASCADE,
  program_id uuid REFERENCES programs(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  
  -- Ensure only one of script_id or program_id is set
  CONSTRAINT likes_target_check CHECK (
    (script_id IS NOT NULL AND program_id IS NULL) OR
    (script_id IS NULL AND program_id IS NOT NULL)
  )
);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Create unique indexes to prevent duplicate likes
CREATE UNIQUE INDEX IF NOT EXISTS likes_user_script_unique 
  ON likes(user_id, script_id) 
  WHERE script_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS likes_user_program_unique 
  ON likes(user_id, program_id) 
  WHERE program_id IS NOT NULL;

-- Policies
CREATE POLICY "Users can manage their own likes"
  ON likes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view likes"
  ON likes
  FOR SELECT
  TO public
  USING (true);