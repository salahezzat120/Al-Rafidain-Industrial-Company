-- Fix warehouses table - Add responsible_person columns if they don't exist
-- This script ensures the warehouses table has the required columns

-- Check if responsible_person column exists, if not add it
DO $$ 
BEGIN
    -- Add responsible_person column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'warehouses' 
        AND column_name = 'responsible_person'
    ) THEN
        ALTER TABLE warehouses ADD COLUMN responsible_person VARCHAR(255);
    END IF;
    
    -- Add responsible_person_ar column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'warehouses' 
        AND column_name = 'responsible_person_ar'
    ) THEN
        ALTER TABLE warehouses ADD COLUMN responsible_person_ar VARCHAR(255);
    END IF;
    
    -- Add warehouse_type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'warehouses' 
        AND column_name = 'warehouse_type'
    ) THEN
        ALTER TABLE warehouses ADD COLUMN warehouse_type VARCHAR(50) DEFAULT 'DISTRIBUTION';
    END IF;
    
    -- Add capacity column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'warehouses' 
        AND column_name = 'capacity'
    ) THEN
        ALTER TABLE warehouses ADD COLUMN capacity DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Add current_utilization column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'warehouses' 
        AND column_name = 'current_utilization'
    ) THEN
        ALTER TABLE warehouses ADD COLUMN current_utilization DECIMAL(5,2) DEFAULT 0;
    END IF;
    
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'warehouses' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE warehouses ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'warehouses' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE warehouses ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'warehouses' 
ORDER BY ordinal_position;

-- Now try the insert again
INSERT INTO warehouses (warehouse_name, warehouse_name_ar, location, location_ar, responsible_person, responsible_person_ar, capacity) VALUES
('Main Warehouse', 'المستودع الرئيسي', 'Baghdad', 'بغداد', 'Ahmed Ali', 'أحمد علي', 10000),
('Distribution Center', 'مركز التوزيع', 'Cairo', 'القاهرة', 'Mohamed Hassan', 'محمد حسن', 5000)
ON CONFLICT DO NOTHING;
