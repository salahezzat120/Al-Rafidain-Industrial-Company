-- Database Schema for Al-Rafidain Industrial Company
-- Visit Management and Messaging System

-- Visits table
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

-- Delegates table
CREATE TABLE IF NOT EXISTS delegates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('driver', 'supervisor', 'technician', 'sales_rep')),
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'busy', 'offline', 'on_visit')),
    current_location TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Visit alerts table
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

-- Internal messages table
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

-- Chat messages table
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

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_visits_delegate_id ON visits(delegate_id);
CREATE INDEX IF NOT EXISTS idx_visits_status ON visits(status);
CREATE INDEX IF NOT EXISTS idx_visits_scheduled_start_time ON visits(scheduled_start_time);
CREATE INDEX IF NOT EXISTS idx_visit_alerts_is_read ON visit_alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_visit_alerts_created_at ON visit_alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_internal_messages_recipient_id ON internal_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_internal_messages_is_read ON internal_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);

-- RLS (Row Level Security) policies
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE delegates ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (adjust as needed for your security requirements)
CREATE POLICY "Allow all operations for authenticated users" ON visits FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON delegates FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON visit_alerts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON internal_messages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON chat_messages FOR ALL USING (auth.role() = 'authenticated');

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON visits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_delegates_updated_at BEFORE UPDATE ON delegates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data (optional - for testing)
INSERT INTO delegates (name, email, phone, role, status, current_location) VALUES
('Mike Johnson', 'mike.johnson@company.com', '+1 (555) 123-4567', 'driver', 'available', 'Downtown'),
('Sarah Wilson', 'sarah.wilson@company.com', '+1 (555) 234-5678', 'supervisor', 'busy', 'North Zone'),
('David Chen', 'david.chen@company.com', '+1 (555) 345-6789', 'technician', 'available', 'East District');

-- Sample visits (optional - for testing)
INSERT INTO visits (delegate_id, delegate_name, customer_id, customer_name, customer_address, scheduled_start_time, scheduled_end_time, visit_type, priority, notes, allowed_duration_minutes) VALUES
('1', 'Mike Johnson', '1', 'ABC Corporation', '123 Business St, Downtown', NOW() + INTERVAL '2 hours', NOW() + INTERVAL '3 hours', 'delivery', 'high', 'Urgent delivery for VIP customer', 60),
('2', 'Sarah Wilson', '2', 'XYZ Industries', '456 Industrial Ave, North Zone', NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '30 minutes', 'inspection', 'medium', 'Regular maintenance inspection', 90),
('3', 'David Chen', '3', 'Tech Solutions Ltd', '789 Innovation Blvd, East District', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour', 'meeting', 'low', 'Client meeting to discuss new requirements', 60);
