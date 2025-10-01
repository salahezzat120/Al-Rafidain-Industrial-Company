-- Recreate warehouses table with all required columns
-- This script drops and recreates the warehouses table to ensure all columns exist

-- Drop existing warehouses table if it exists (WARNING: This will delete all data)
-- Uncomment the next line only if you want to recreate the table from scratch
-- DROP TABLE IF EXISTS warehouses CASCADE;

-- Create warehouses table with all required columns
CREATE TABLE IF NOT EXISTS warehouses (
  id SERIAL PRIMARY KEY,
  warehouse_name VARCHAR(255) NOT NULL,
  warehouse_name_ar VARCHAR(255),
  location VARCHAR(255) NOT NULL,
  location_ar VARCHAR(255),
  responsible_person VARCHAR(255),
  responsible_person_ar VARCHAR(255),
  warehouse_type VARCHAR(50) DEFAULT 'DISTRIBUTION',
  capacity DECIMAL(10,2) DEFAULT 0,
  current_utilization DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_warehouses_name ON warehouses(warehouse_name);
CREATE INDEX IF NOT EXISTS idx_warehouses_location ON warehouses(location);
CREATE INDEX IF NOT EXISTS idx_warehouses_type ON warehouses(warehouse_type);
CREATE INDEX IF NOT EXISTS idx_warehouses_active ON warehouses(is_active);

-- Insert sample warehouses
INSERT INTO warehouses (warehouse_name, warehouse_name_ar, location, location_ar, responsible_person, responsible_person_ar, capacity) VALUES
('Main Warehouse', 'المستودع الرئيسي', 'Baghdad', 'بغداد', 'Ahmed Ali', 'أحمد علي', 10000),
('Distribution Center', 'مركز التوزيع', 'Cairo', 'القاهرة', 'Mohamed Hassan', 'محمد حسن', 5000)
ON CONFLICT DO NOTHING;

-- Verify the table was created correctly
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'warehouses' 
ORDER BY ordinal_position;

-- Show sample data
SELECT * FROM warehouses;
