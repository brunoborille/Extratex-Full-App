/*
  # Allow Anonymous Access to Client Default Settings

  1. Changes
    - Drop authenticated-only policies
    - Create new policies that allow anon role access
    - This is necessary because the app doesn't have authentication
    
  2. Security
    - Policies allow anon role full access
    - In production, you would want to add authentication
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view client default settings" ON client_default_settings;
DROP POLICY IF EXISTS "Authenticated users can insert client default settings" ON client_default_settings;
DROP POLICY IF EXISTS "Authenticated users can update client default settings" ON client_default_settings;
DROP POLICY IF EXISTS "Authenticated users can delete client default settings" ON client_default_settings;

-- Create new policies for anon role
CREATE POLICY "Allow anon to view client default settings"
  ON client_default_settings
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon to insert client default settings"
  ON client_default_settings
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon to update client default settings"
  ON client_default_settings
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon to delete client default settings"
  ON client_default_settings
  FOR DELETE
  TO anon
  USING (true);

-- Also add policies for authenticated users in case auth is added later
CREATE POLICY "Allow authenticated to view client default settings"
  ON client_default_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated to insert client default settings"
  ON client_default_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated to update client default settings"
  ON client_default_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated to delete client default settings"
  ON client_default_settings
  FOR DELETE
  TO authenticated
  USING (true);
