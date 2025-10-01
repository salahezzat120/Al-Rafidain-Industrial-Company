-- Fix warehouses table columns - Handle both manager_name and responsible_person
-- This script ensures compatibility with different schema versions

-- Check if the table exists and what columns it has
DO $$ 
DECLARE
    has_manager_name BOOLEAN := FALSE;
    has_responsible_person BOOLEAN := FALSE;
BEGIN
    -- Check if manager_name column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'warehouses' 
        AND column_name = 'manager_name'
    ) INTO has_manager_name;
    
    -- Check if responsible_person column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'warehouses' 
        AND column_name = 'responsible_person'
    ) INTO has_responsible_person;
    
    -- If we have manager_name but not responsible_person, add responsible_person
    IF has_manager_name AND NOT has_responsible_person THEN
        ALTER TABLE warehouses ADD COLUMN responsible_person VARCHAR(255);
        ALTER TABLE warehouses ADD COLUMN responsible_person_ar VARCHAR(255);
        
        -- Copy data from manager_name to responsible_person
        UPDATE warehouses 
        SET responsible_person = manager_name,
            responsible_person_ar = manager_name_ar
        WHERE responsible_person IS NULL;
    END IF;
    
    -- If we have responsible_person but not manager_name, add manager_name
    IF has_responsible_person AND NOT has_manager_name THEN
        ALTER TABLE warehouses ADD COLUMN manager_name VARCHAR(255);
        ALTER TABLE warehouses ADD COLUMN manager_name_ar VARCHAR(255);
        
        -- Copy data from responsible_person to manager_name
        UPDATE warehouses 
        SET manager_name = responsible_person,
            manager_name_ar = responsible_person_ar
        WHERE manager_name IS NULL;
    END IF;
    
    -- If neither exists, add both
    IF NOT has_manager_name AND NOT has_responsible_person THEN
        ALTER TABLE warehouses ADD COLUMN responsible_person VARCHAR(255);
        ALTER TABLE warehouses ADD COLUMN responsible_person_ar VARCHAR(255);
        ALTER TABLE warehouses ADD COLUMN manager_name VARCHAR(255);
        ALTER TABLE warehouses ADD COLUMN manager_name_ar VARCHAR(255);
    END IF;
    
    -- Add other missing columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'warehouses' AND column_name = 'warehouse_type'
    ) THEN
        ALTER TABLE warehouses ADD COLUMN warehouse_type VARCHAR(50) DEFAULT 'DISTRIBUTION';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'warehouses' AND column_name = 'capacity'
    ) THEN
        ALTER TABLE warehouses ADD COLUMN capacity DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'warehouses' AND column_name = 'current_utilization'
    ) THEN
        ALTER TABLE warehouses ADD COLUMN current_utilization DECIMAL(5,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'warehouses' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE warehouses ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'warehouses' AND column_name = 'contact_phone'
    ) THEN
        ALTER TABLE warehouses ADD COLUMN contact_phone VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'warehouses' AND column_name = 'contact_email'
    ) THEN
        ALTER TABLE warehouses ADD COLUMN contact_email VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'warehouses' AND column_name = 'status'
    ) THEN
        ALTER TABLE warehouses ADD COLUMN status VARCHAR(20) DEFAULT 'ACTIVE' 
        CHECK (status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE'));
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'warehouses' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE warehouses ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'warehouses' 
ORDER BY ordinal_position;

-- Now try the insert with the correct column names
-- First check which columns exist
DO $$
BEGIN
    -- Try to insert with responsible_person if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'warehouses' AND column_name = 'responsible_person'
    ) THEN
        INSERT INTO warehouses (warehouse_name, warehouse_name_ar, location, location_ar, responsible_person, responsible_person_ar, capacity) VALUES
        ('Main Warehouse', 'المستودع الرئيسي', 'Baghdad', 'بغداد', 'Ahmed Ali', 'أحمد علي', 10000),
        ('Distribution Center', 'مركز التوزيع', 'Cairo', 'القاهرة', 'Mohamed Hassan', 'محمد حسن', 5000)
        ON CONFLICT DO NOTHING;
    ELSE
        -- Use manager_name if responsible_person doesn't exist
        INSERT INTO warehouses (warehouse_name, warehouse_name_ar, location, location_ar, manager_name, manager_name_ar, capacity) VALUES
        ('Main Warehouse', 'المستودع الرئيسي', 'Baghdad', 'بغداد', 'Ahmed Ali', 'أحمد علي', 10000),
        ('Distribution Center', 'مركز التوزيع', 'Cairo', 'القاهرة', 'Mohamed Hassan', 'محمد حسن', 5000)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Show the results
SELECT * FROM warehouses;
