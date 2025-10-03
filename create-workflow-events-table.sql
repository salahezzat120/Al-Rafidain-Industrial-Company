-- Create workflow_events table
CREATE TABLE IF NOT EXISTS workflow_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('PRODUCTION', 'SALES', 'DELIVERY', 'RETURN')),
    description TEXT NOT NULL,
    description_ar TEXT,
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    reference_number VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workflow_events_type ON workflow_events(event_type);
CREATE INDEX IF NOT EXISTS idx_workflow_events_status ON workflow_events(status);
CREATE INDEX IF NOT EXISTS idx_workflow_events_warehouse ON workflow_events(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_workflow_events_product ON workflow_events(product_id);
CREATE INDEX IF NOT EXISTS idx_workflow_events_created_at ON workflow_events(created_at);

-- Enable RLS
ALTER TABLE workflow_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations on workflow_events" ON workflow_events
    FOR ALL USING (true);

-- Create trigger to update updated_at
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

-- Insert sample workflow events
INSERT INTO workflow_events (event_type, description, description_ar, warehouse_id, product_id, quantity, reference_number, status) VALUES
('PRODUCTION', 'New production batch completed', 'تم إكمال دفعة إنتاج جديدة', 1, 1, 1000, 'PROD-2024-001', 'PENDING'),
('SALES', 'Sales order processed', 'تم معالجة طلب البيع', 1, 1, 500, 'SO-2024-001', 'PENDING'),
('DELIVERY', 'Delivery completed to customer', 'تم إكمال التوصيل للعميل', 1, 1, 200, 'DEL-2024-001', 'PENDING'),
('RETURN', 'Customer return processed', 'تم معالجة إرجاع العميل', 1, 1, 50, 'RET-2024-001', 'PENDING')
ON CONFLICT DO NOTHING;
