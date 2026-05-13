/*
  # Create Suppliers Table

  1. New Tables
    - `suppliers`
      - `id` (uuid, primary key) - Unique identifier for each supplier
      - `name` (text, unique) - Supplier name (e.g., "Andre")
      - `profit_margin` (numeric) - Company profit margin percentage (default: 40)
      - `usd_brl_rate` (numeric) - USD to BRL exchange rate
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

  2. Security
    - Enable RLS on `suppliers` table
    - Add policy for anonymous users to read supplier data
    - Add policy for anonymous users to insert suppliers
    - Add policy for anonymous users to update suppliers
    - Add policy for anonymous users to delete suppliers
*/

CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  profit_margin numeric NOT NULL DEFAULT 40,
  usd_brl_rate numeric NOT NULL DEFAULT 5.0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access to suppliers"
  ON suppliers
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert access to suppliers"
  ON suppliers
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update access to suppliers"
  ON suppliers
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete access to suppliers"
  ON suppliers
  FOR DELETE
  TO anon
  USING (true);