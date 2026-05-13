/*
  # Fix RLS Policies for Client Default Settings

  1. Changes
    - Drop the overly restrictive policy
    - Create separate policies for SELECT, INSERT, UPDATE, DELETE
    - Each policy properly checks authentication but allows all operations
    
  2. Security
    - All policies require authenticated user
    - Policies use proper USING and WITH CHECK clauses
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON client_default_settings;

-- Create separate policies for each operation
CREATE POLICY "Authenticated users can view client default settings"
  ON client_default_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert client default settings"
  ON client_default_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update client default settings"
  ON client_default_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete client default settings"
  ON client_default_settings
  FOR DELETE
  TO authenticated
  USING (true);
