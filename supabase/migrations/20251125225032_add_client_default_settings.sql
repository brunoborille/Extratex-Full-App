/*
  # Add Client Default Settings Table

  1. New Tables
    - `client_default_settings`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key to clients)
      - `default_copper_formula_id` (uuid, nullable)
      - `default_gold_formula_id` (uuid, nullable)
      - `default_silver_formula_id` (uuid, nullable)
      - `default_treatment_charge` (numeric, default 0)
      - `default_copper_refining` (numeric, default 0)
      - `default_gold_refining` (numeric, default 0)
      - `default_silver_refining` (numeric, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `client_default_settings` table
    - Add policy for authenticated users to manage settings
*/

CREATE TABLE IF NOT EXISTS client_default_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  default_copper_formula_id uuid REFERENCES client_formulas(id) ON DELETE SET NULL,
  default_gold_formula_id uuid REFERENCES client_formulas(id) ON DELETE SET NULL,
  default_silver_formula_id uuid REFERENCES client_formulas(id) ON DELETE SET NULL,
  default_treatment_charge numeric DEFAULT 0,
  default_copper_refining numeric DEFAULT 0,
  default_gold_refining numeric DEFAULT 0,
  default_silver_refining numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(client_id)
);

ALTER TABLE client_default_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for authenticated users"
  ON client_default_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_client_default_settings_client_id 
  ON client_default_settings(client_id);

CREATE INDEX IF NOT EXISTS idx_client_default_settings_copper_formula 
  ON client_default_settings(default_copper_formula_id);

CREATE INDEX IF NOT EXISTS idx_client_default_settings_gold_formula 
  ON client_default_settings(default_gold_formula_id);

CREATE INDEX IF NOT EXISTS idx_client_default_settings_silver_formula 
  ON client_default_settings(default_silver_formula_id);
