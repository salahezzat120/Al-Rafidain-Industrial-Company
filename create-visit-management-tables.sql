-- =====================================================
-- VISIT MANAGEMENT SYSTEM DATABASE SETUP
-- Al-Rafidain Industrial Company
-- =====================================================

-- Enable UUID extension for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- VISIT MANAGEMENT TABLES
-- =====================================================

-- Visits table - Main table for visit scheduling and tracking
CREATE TABLE IF NOT EXISTS visits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    delegate_id TEXT NOT NULL,
    delegate_name TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    scheduled_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'late')),
    visit_type TEXT NOT NULL DEFAULT 'delivery' CHECK (visit_type IN ('delivery', 'pickup', 'inspection', 'maintenance', 'meeting')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    notes TEXT,
    allowed_duration_minutes INTEGER NOT NULL DEFAULT 60,
    is_late BOOLEAN DEFAULT FALSE,
    exceeds_time_limit BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Delegates table - Staff members who can perform visits
CREATE TABLE IF NOT EXISTS delegates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('driver', 'representative', 'supervisor', 'technician', 'sales_rep')),
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'busy', 'offline', 'on_visit', 'active', 'inactive', 'on-route')),
    current_location TEXT,
    avatar_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Representatives table - Extended delegate information
CREATE TABLE IF NOT EXISTS representatives (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    address TEXT,
    license_number TEXT,
    emergency_contact TEXT,
    vehicle TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on-route', 'offline')),
    coverage_areas TEXT[] DEFAULT '{}',
    transportation_type TEXT NOT NULL DEFAULT 'foot' CHECK (transportation_type IN ('foot', 'vehicle')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Visit alerts table - Alerts for late visits, exceeded time, etc.
CREATE TABLE IF NOT EXISTS visit_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    delegate_id TEXT NOT NULL,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('late_arrival', 'time_exceeded', 'no_show', 'early_completion')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    admin_notified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Internal messages table - Communication between staff
CREATE TABLE IF NOT EXISTS internal_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    sender_role TEXT NOT NULL,
    recipient_id TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    recipient_role TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'system_alert', 'visit_update', 'urgent')),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table - Chatbot conversation history
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    sender_role TEXT NOT NULL,
    message TEXT NOT NULL,
    message_type TEXT NOT NULL CHECK (message_type IN ('user', 'bot')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Visits table indexes
CREATE INDEX IF NOT EXISTS idx_visits_delegate_id ON visits(delegate_id);
CREATE INDEX IF NOT EXISTS idx_visits_customer_id ON visits(customer_id);
CREATE INDEX IF NOT EXISTS idx_visits_status ON visits(status);
CREATE INDEX IF NOT EXISTS idx_visits_scheduled_start_time ON visits(scheduled_start_time);
CREATE INDEX IF NOT EXISTS idx_visits_created_at ON visits(created_at);

-- Delegates table indexes
CREATE INDEX IF NOT EXISTS idx_delegates_email ON delegates(email);
CREATE INDEX IF NOT EXISTS idx_delegates_status ON delegates(status);
CREATE INDEX IF NOT EXISTS idx_delegates_role ON delegates(role);

-- Representatives table indexes
CREATE INDEX IF NOT EXISTS idx_representatives_email ON representatives(email);
CREATE INDEX IF NOT EXISTS idx_representatives_status ON representatives(status);

-- Visit alerts table indexes
CREATE INDEX IF NOT EXISTS idx_visit_alerts_visit_id ON visit_alerts(visit_id);
CREATE INDEX IF NOT EXISTS idx_visit_alerts_delegate_id ON visit_alerts(delegate_id);
CREATE INDEX IF NOT EXISTS idx_visit_alerts_is_read ON visit_alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_visit_alerts_created_at ON visit_alerts(created_at);

-- Internal messages table indexes
CREATE INDEX IF NOT EXISTS idx_internal_messages_sender_id ON internal_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_internal_messages_recipient_id ON internal_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_internal_messages_is_read ON internal_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_internal_messages_created_at ON internal_messages(created_at);

-- Chat messages table indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE delegates ENABLE ROW LEVEL SECURITY;
ALTER TABLE representatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for visits table
CREATE POLICY "Allow all operations for authenticated users" ON visits 
    FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for delegates table
CREATE POLICY "Allow all operations for authenticated users" ON delegates 
    FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for representatives table
CREATE POLICY "Allow all operations for authenticated users" ON representatives 
    FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for visit_alerts table
CREATE POLICY "Allow all operations for authenticated users" ON visit_alerts 
    FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for internal_messages table
CREATE POLICY "Allow all operations for authenticated users" ON internal_messages 
    FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for chat_messages table
CREATE POLICY "Allow all operations for authenticated users" ON chat_messages 
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_visits_updated_at 
    BEFORE UPDATE ON visits 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delegates_updated_at 
    BEFORE UPDATE ON delegates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_representatives_updated_at 
    BEFORE UPDATE ON representatives 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample delegates
INSERT INTO delegates (name, email, phone, role, status) VALUES
('Mike Johnson', 'mike.johnson@company.com', '+1 (555) 123-4567', 'driver', 'available'),
('Sarah Wilson', 'sarah.wilson@company.com', '+1 (555) 234-5678', 'supervisor', 'busy'),
('David Chen', 'david.chen@company.com', '+1 (555) 345-6789', 'technician', 'available'),
('Lisa Brown', 'lisa.brown@company.com', '+1 (555) 456-7890', 'sales_rep', 'available'),
('John Smith', 'john.smith@company.com', '+1 (555) 567-8901', 'representative', 'on_visit');

-- Insert sample representatives
INSERT INTO representatives (name, email, phone, address, status, transportation_type) VALUES
('Mike Johnson', 'mike.johnson@company.com', '+1 (555) 123-4567', '123 Main St, City', 'active', 'vehicle'),
('Sarah Wilson', 'sarah.wilson@company.com', '+1 (555) 234-5678', '456 Oak Ave, City', 'active', 'foot'),
('David Chen', 'david.chen@company.com', '+1 (555) 345-6789', '789 Pine Rd, City', 'active', 'vehicle');

-- Insert sample visits
INSERT INTO visits (delegate_id, delegate_name, customer_id, customer_name, customer_address, scheduled_start_time, scheduled_end_time, visit_type, priority, notes, allowed_duration_minutes) VALUES
('1', 'Mike Johnson', 'C001', 'ABC Corporation', '123 Business St, Downtown', NOW() + INTERVAL '2 hours', NOW() + INTERVAL '3 hours', 'delivery', 'high', 'Urgent delivery for VIP customer', 60),
('2', 'Sarah Wilson', 'C002', 'XYZ Industries', '456 Industrial Ave, North Zone', NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '30 minutes', 'inspection', 'medium', 'Regular maintenance inspection', 90),
('3', 'David Chen', 'C003', 'Tech Solutions Ltd', '789 Innovation Blvd, East District', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour', 'meeting', 'low', 'Client meeting to discuss new requirements', 60);

-- =====================================================
-- FUNCTIONS FOR VISIT MANAGEMENT
-- =====================================================

-- Function to check for late visits
CREATE OR REPLACE FUNCTION check_late_visits()
RETURNS TABLE(visit_id UUID, delegate_name TEXT, customer_name TEXT, minutes_late INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.id,
        v.delegate_name,
        v.customer_name,
        EXTRACT(EPOCH FROM (NOW() - v.scheduled_start_time))/60::INTEGER as minutes_late
    FROM visits v
    WHERE v.status = 'scheduled'
    AND v.scheduled_start_time < NOW()
    AND v.is_late = FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to check for exceeded time visits
CREATE OR REPLACE FUNCTION check_exceeded_time_visits()
RETURNS TABLE(visit_id UUID, delegate_name TEXT, customer_name TEXT, minutes_exceeded INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.id,
        v.delegate_name,
        v.customer_name,
        EXTRACT(EPOCH FROM (NOW() - v.actual_start_time))/60::INTEGER - v.allowed_duration_minutes as minutes_exceeded
    FROM visits v
    WHERE v.status = 'in_progress'
    AND v.actual_start_time IS NOT NULL
    AND v.exceeds_time_limit = FALSE
    AND NOW() - v.actual_start_time > INTERVAL '1 minute' * v.allowed_duration_minutes;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Visit Management System database setup completed successfully!';
    RAISE NOTICE 'Tables created: visits, delegates, representatives, visit_alerts, internal_messages, chat_messages';
    RAISE NOTICE 'Indexes, RLS policies, and triggers have been set up';
    RAISE NOTICE 'Sample data has been inserted';
END $$;
