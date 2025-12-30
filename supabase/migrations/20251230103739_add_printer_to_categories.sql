/*
  # Add printer field to categories table

  1. Changes
    - Add `printer` column to `categories` table to store printer assignment (cuisine, bar, or caisse)
    - This allows categories to have default printer assignments

  2. Notes
    - The printer field is optional (nullable)
    - Valid values are: 'cuisine', 'bar', 'caisse'
*/

-- Add printer column to categories table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'printer'
  ) THEN
    ALTER TABLE categories ADD COLUMN printer text;
  END IF;
END $$;
