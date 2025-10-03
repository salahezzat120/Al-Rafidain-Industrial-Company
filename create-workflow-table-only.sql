-- =====================================================
-- Workflow Events Table Creation
-- =====================================================
-- This script creates only the workflow_events table with all necessary components

-- =====================================================
-- 1. CREATE WORKFLOW EVENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS workflow_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('PRODUCTION', 'SALES', 'DELIVERY', 'RETURN')),
    description TEXT NOT NULL,
    description_ar TEXT,
    warehouse_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    reference_number VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_workflow_events_type ON workflow_events(event_type);
CREATE INDEX IF NOT EXISTS idx_workflow_events_status ON workflow_events(status);
CREATE INDEX IF NOT EXISTS idx_workflow_events_warehouse ON workflow_events(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_workflow_events_product ON workflow_events(product_id);
CREATE INDEX IF NOT EXISTS idx_workflow_events_created_at ON workflow_events(created_at);
CREATE INDEX IF NOT EXISTS idx_workflow_events_reference ON workflow_events(reference_number);

-- =====================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE workflow_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations on workflow_events" ON workflow_events
    FOR ALL USING (true);

-- =====================================================
-- 4. CREATE TRIGGER FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_workflow_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_workflow_events_updated_at
    BEFORE UPDATE ON workflow_events
    FOR EACH ROW
    EXECUTE FUNCTION update_workflow_events_updated_at();

-- =====================================================
-- 5. CREATE FOREIGN KEY CONSTRAINTS
-- =====================================================
-- Add foreign key constraints if they don't exist
DO $$
BEGIN
    -- Add warehouse foreign key constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'workflow_events_warehouse_id_fkey'
    ) THEN
        ALTER TABLE workflow_events 
        ADD CONSTRAINT workflow_events_warehouse_id_fkey 
        FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE;
    END IF;

    -- Add product foreign key constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'workflow_events_product_id_fkey'
    ) THEN
        ALTER TABLE workflow_events 
        ADD CONSTRAINT workflow_events_product_id_fkey 
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
    END IF;
END $$;

-- =====================================================
-- 6. VERIFICATION
-- =====================================================
-- Check that the table was created successfully
SELECT 
    'Workflow Events Table Created Successfully!' as status,
    COUNT(*) as existing_records
FROM workflow_events;

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'workflow_events'
ORDER BY ordinal_position;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Workflow Events Table Created Successfully!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Features:';
    RAISE NOTICE '- Event Types: PRODUCTION, SALES, DELIVERY, RETURN';
    RAISE NOTICE '- Status: PENDING, IN_PROGRESS, COMPLETED, FAILED';
    RAISE NOTICE '- Foreign Keys: warehouses.id, products.id';
    RAISE NOTICE '- Indexes: All important columns indexed';
    RAISE NOTICE '- RLS: Row Level Security enabled';
    RAISE NOTICE '- Auto-updating timestamps';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Ready for workflow integration!';
    RAISE NOTICE '=====================================================';
END $$;
