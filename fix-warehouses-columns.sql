-- Fix warehouses table - Add missing columns
-- Run this in your Supabase SQL Editor

-- Add missing columns to warehouses table
ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS responsible_person VARCHAR(255);
ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS responsible_person_ar VARCHAR(255);
ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS warehouse_type VARCHAR(50) DEFAULT 'DISTRIBUTION';
ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS capacity DECIMAL(10,2) DEFAULT 0;
ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS current_utilization DECIMAL(5,2) DEFAULT 0;
ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'warehouses' 
ORDER BY ordinal_position;

-- Now try the insert again
INSERT INTO warehouses (warehouse_name, warehouse_name_ar, location, location_ar, responsible_person, responsible_person_ar, capacity) VALUES
('Main Warehouse', 'المستودع الرئيسي', 'Baghdad', 'بغداد', 'Ahmed Ali', 'أحمد علي', 10000),
('Distribution Center', 'مركز التوزيع', 'Cairo', 'القاهرة', 'Mohamed Hassan', 'محمد حسن', 5000)
ON CONFLICT DO NOTHING;

-- Show the results
SELECT * FROM warehouses;
