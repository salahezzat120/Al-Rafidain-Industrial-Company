-- Warehouse table SQL with location fields
-- This includes latitude, longitude, and address fields for map-based location selection

CREATE TABLE IF NOT EXISTS warehouses (
  id SERIAL PRIMARY KEY,
  warehouse_name VARCHAR(255) NOT NULL,
  warehouse_name_ar VARCHAR(255),
  location VARCHAR(255) NOT NULL,
  location_ar VARCHAR(255),
  address TEXT, -- Full address from map selection
  latitude DECIMAL(10, 8), -- Latitude coordinate
  longitude DECIMAL(11, 8), -- Longitude coordinate
  responsible_person VARCHAR(255),
  responsible_person_ar VARCHAR(255),
  warehouse_type VARCHAR(50) DEFAULT 'DISTRIBUTION',
  capacity DECIMAL(10,2) DEFAULT 0,
  current_utilization DECIMAL(5,2) DEFAULT 0,
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_warehouses_name ON warehouses(warehouse_name);
CREATE INDEX IF NOT EXISTS idx_warehouses_location ON warehouses(location);
CREATE INDEX IF NOT EXISTS idx_warehouses_coordinates ON warehouses(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_warehouses_type ON warehouses(warehouse_type);
CREATE INDEX IF NOT EXISTS idx_warehouses_active ON warehouses(is_active);

-- Insert sample warehouses with coordinates
INSERT INTO warehouses (
  warehouse_name, 
  warehouse_name_ar, 
  location, 
  location_ar, 
  address,
  latitude, 
  longitude,
  responsible_person, 
  responsible_person_ar, 
  capacity
) VALUES
(
  'Main Warehouse', 
  'المستودع الرئيسي', 
  'Baghdad', 
  'بغداد',
  'Baghdad, Iraq',
  33.3152, 
  44.3661,
  'Ahmed Ali', 
  'أحمد علي', 
  10000
),
(
  'Distribution Center', 
  'مركز التوزيع', 
  'Cairo', 
  'القاهرة',
  'Cairo, Egypt',
  30.0444, 
  31.2357,
  'Mohamed Hassan', 
  'محمد حسن', 
  5000
)
ON CONFLICT DO NOTHING;
