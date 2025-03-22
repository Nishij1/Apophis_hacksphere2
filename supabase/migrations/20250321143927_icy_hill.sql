/*
  # Create translations table and security policies

  1. New Tables
    - `translations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `original_text` (text)
      - `translated_text` (text)
      - `source_language` (text)
      - `target_language` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on translations table
    - Add policies for authenticated users to:
      - Read their own translations
      - Create new translations
      - Delete their own translations
*/

CREATE TABLE translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  original_text text NOT NULL,
  translated_text text NOT NULL,
  source_language text NOT NULL,
  target_language text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own translations"
  ON translations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create translations"
  ON translations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own translations"
  ON translations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX translations_user_id_idx ON translations(user_id);
CREATE INDEX translations_created_at_idx ON translations(created_at DESC);