/*
  # Create programs table

  1. New Tables
    - `programs`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text, nullable)
      - `version` (text, default '1.0.0')
      - `download_url` (text, nullable)
      - `file_size` (text, nullable)
      - `thumbnail_url` (text, nullable)
      - `download_count` (integer, default 0)
      - `view_count` (integer, default 0)
      - `is_featured` (boolean, default false)
      - `created_by` (uuid, foreign key to auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `programs` table
    - Add policies for viewing and admin management
*/

CREATE TABLE IF NOT EXISTS programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  version text DEFAULT '1.0.0',
  download_url text,
  file_size text,
  thumbnail_url text,
  download_count integer DEFAULT 0,
  view_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view programs"
  ON programs
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage programs"
  ON programs
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