-- =====================================================
-- SINGLE VISIT MANAGEMENT TABLE
-- Al-Rafidain Industrial Company
-- =====================================================

-- Enable UUID extension for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- DROP EXISTING TABLES (if they exist)
-- =====================================================

DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS internal_messages CASCADE;
DROP TABLE IF EXISTS visit_alerts CASCADE;
DROP TABLE IF EXISTS visits CASCADE;
DROP TABLE IF EXISTS delegates CASCADE;
DROP TABLE IF EXISTS representatives CASCADE;

-- =====================================================
-- CREATE SINGLE VISIT MANAGEMENT TABLE
-- =====================================================

CREATE TABLE visit_management (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Visit Information
    visit_id TEXT NOT NULL UNIQUE, -- Custom visit ID like V001, V002
    delegate_id TEXT NOT NULL,
    delegate_name TEXT NOT NULL,
    delegate_email TEXT,
    delegate_phone TEXT,
    delegate_role TEXT NOT NULL CHECK (delegate_role IN ('driver', 'representative', 'supervisor', 'technician', 'sales_rep')),
    delegate_status TEXT NOT NULL DEFAULT 'available' CHECK (delegate_status IN ('available', 'busy', 'offline', 'on_visit', 'active', 'inactive', 'on-route')),
    
    -- Customer Information
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    customer_phone TEXT,
    customer_email TEXT,
    
    -- Visit Scheduling
    scheduled_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    
    -- Visit Details
    visit_type TEXT NOT NULL DEFAULT 'delivery' CHECK (visit_type IN ('delivery', 'pickup', 'inspection', 'maintenance', 'meeting')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'late')),
    
    -- Visit Management
    allowed_duration_minutes INTEGER NOT NULL DEFAULT 60,
    is_late BOOLEAN DEFAULT FALSE,
    exceeds_time_limit BOOLEAN DEFAULT FALSE,
    notes TEXT,
    
    -- Alert Information
    alert_type TEXT CHECK (alert_type IN ('late_arrival', 'time_exceeded', 'no_show', 'early_completion')),
    alert_severity TEXT CHECK (alert_severity IN ('low', 'medium', 'high', 'critical')),
    alert_message TEXT,
    is_alert_read BOOLEAN DEFAULT FALSE,
    admin_notified BOOLEAN DEFAULT FALSE,
    
    -- Communication
    internal_message TEXT,
    message_type TEXT CHECK (message_type IN ('text', 'system_alert', 'visit_update', 'urgent')),
    message_priority TEXT DEFAULT 'medium' CHECK (message_priority IN ('low', 'medium', 'high', 'urgent')),
    is_message_read BOOLEAN DEFAULT FALSE,
    
    -- Chat Information
    chat_message TEXT,
    chat_sender_id TEXT,
    chat_sender_name TEXT,
    chat_sender_role TEXT,
    chat_message_type TEXT CHECK (chat_message_type IN ('user', 'bot')),
    
    -- Location Information
    current_location TEXT,
    coverage_areas TEXT[] DEFAULT '{}',
    transportation_type TEXT DEFAULT 'foot' CHECK (transportation_type IN ('foot', 'vehicle')),
    
    -- Additional Information
    license_number TEXT,
    emergency_contact TEXT,
    vehicle TEXT,
    avatar_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Primary indexes
CREATE INDEX IF NOT EXISTS idx_visit_management_visit_id ON visit_management(visit_id);
CREATE INDEX IF NOT EXISTS idx_visit_management_delegate_id ON visit_management(delegate_id);
CREATE INDEX IF NOT EXISTS idx_visit_management_customer_id ON visit_management(customer_id);
CREATE INDEX IF NOT EXISTS idx_visit_management_status ON visit_management(status);
CREATE INDEX IF NOT EXISTS idx_visit_management_visit_type ON visit_management(visit_type);
CREATE INDEX IF NOT EXISTS idx_visit_management_priority ON visit_management(priority);

-- Time-based indexes
CREATE INDEX IF NOT EXISTS idx_visit_management_scheduled_start_time ON visit_management(scheduled_start_time);
CREATE INDEX IF NOT EXISTS idx_visit_management_created_at ON visit_management(created_at);

-- Alert indexes
CREATE INDEX IF NOT EXISTS idx_visit_management_alert_type ON visit_management(alert_type);
CREATE INDEX IF NOT EXISTS idx_visit_management_is_alert_read ON visit_management(is_alert_read);
CREATE INDEX IF NOT EXISTS idx_visit_management_is_late ON visit_management(is_late);

-- Message indexes
CREATE INDEX IF NOT EXISTS idx_visit_management_is_message_read ON visit_management(is_message_read);
CREATE INDEX IF NOT EXISTS idx_visit_management_chat_sender_id ON visit_management(chat_sender_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE visit_management ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Allow all operations for authenticated users" ON visit_management 
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_visit_management_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updated_at
CREATE TRIGGER update_visit_management_updated_at 
    BEFORE UPDATE ON visit_management 
    FOR EACH ROW EXECUTE FUNCTION update_visit_management_updated_at();

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample visit management records
INSERT INTO visit_management (
    visit_id, delegate_id, delegate_name, delegate_email, delegate_phone, delegate_role, delegate_status,
    customer_id, customer_name, customer_address, customer_phone,
    scheduled_start_time, scheduled_end_time, visit_type, priority, status, notes, allowed_duration_minutes
) VALUES
('V001', 'D001', 'Mike Johnson', 'mike.johnson@company.com', '+1 (555) 123-4567', 'driver', 'available',
 'C001', 'ABC Corporation', '123 Business St, Downtown', '+1 (555) 987-6543',
 NOW() + INTERVAL '2 hours', NOW() + INTERVAL '3 hours', 'delivery', 'high', 'scheduled', 'Urgent delivery for VIP customer', 60),

('V002', 'D002', 'Sarah Wilson', 'sarah.wilson@company.com', '+1 (555) 234-5678', 'supervisor', 'busy',
 'C002', 'XYZ Industries', '456 Industrial Ave, North Zone', '+1 (555) 876-5432',
 NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '30 minutes', 'inspection', 'medium', 'late', 'Regular maintenance inspection', 90),

('V003', 'D003', 'David Chen', 'david.chen@company.com', '+1 (555) 345-6789', 'technician', 'available',
 'C003', 'Tech Solutions Ltd', '789 Innovation Blvd, East District', '+1 (555) 765-4321',
 NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour', 'meeting', 'low', 'in_progress', 'Client meeting to discuss new requirements', 60);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to check for late visits
CREATE OR REPLACE FUNCTION check_late_visits()
RETURNS TABLE(visit_id TEXT, delegate_name TEXT, customer_name TEXT, minutes_late INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        vm.visit_id,
        vm.delegate_name,
        vm.customer_name,
        EXTRACT(EPOCH FROM (NOW() - vm.scheduled_start_time))/60::INTEGER as minutes_late
    FROM visit_management vm
    WHERE vm.status = 'scheduled'
    AND vm.scheduled_start_time < NOW()
    AND vm.is_late = FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to check for exceeded time visits
CREATE OR REPLACE FUNCTION check_exceeded_time_visits()
RETURNS TABLE(visit_id TEXT, delegate_name TEXT, customer_name TEXT, minutes_exceeded INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        vm.visit_id,
        vm.delegate_name,
        vm.customer_name,
        EXTRACT(EPOCH FROM (NOW() - vm.actual_start_time))/60::INTEGER - vm.allowed_duration_minutes as minutes_exceeded
    FROM visit_management vm
    WHERE vm.status = 'in_progress'
    AND vm.actual_start_time IS NOT NULL
    AND vm.exceeds_time_limit = FALSE
    AND NOW() - vm.actual_start_time > INTERVAL '1 minute' * vm.allowed_duration_minutes;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Single Visit Management table created successfully!';
    RAISE NOTICE 'Table name: visit_management';
    RAISE NOTICE 'All visit, delegate, representative, alert, and message data in one table';
    RAISE NOTICE 'Sample data has been inserted';
    RAISE NOTICE 'Indexes, RLS policies, and triggers have been set up';
END $$;
