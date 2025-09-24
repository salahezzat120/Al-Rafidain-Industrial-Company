-- Add default measurement units to the system
-- Run this in your Supabase SQL Editor

-- Insert default measurement units if they don't exist
INSERT INTO units_of_measurement (unit_name, unit_code, is_user_defined, created_at)
VALUES 
  ('Kilogram', 'KG', false, NOW()),
  ('Gram', 'G', false, NOW()),
  ('Liter', 'L', false, NOW()),
  ('Milliliter', 'ML', false, NOW()),
  ('Piece', 'PCS', false, NOW()),
  ('Box', 'BOX', false, NOW()),
  ('Pack', 'PACK', false, NOW()),
  ('Meter', 'M', false, NOW()),
  ('Centimeter', 'CM', false, NOW()),
  ('Square Meter', 'M2', false, NOW()),
  ('Cubic Meter', 'M3', false, NOW())
ON CONFLICT (unit_code) DO NOTHING;

-- Verify the units were added
SELECT unit_name, unit_code, is_user_defined 
FROM units_of_measurement 
ORDER BY unit_name;
