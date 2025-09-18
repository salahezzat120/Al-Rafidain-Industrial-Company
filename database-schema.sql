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
    role TEXT NOT NULL CHECK (role IN ('driver', 'representative', 'supervisor', 'technician', 'sales_rep')),
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'busy', 'offline', 'on_visit', 'active', 'inactive', 'on-route')),
    current_location TEXT,
    avatar_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Representatives table
CREATE TABLE IF NOT EXISTS representatives (
    id TEXT PRIMARY KEY,
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
ALTER TABLE representatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (adjust as needed for your security requirements)
CREATE POLICY "Allow all operations for authenticated users" ON visits FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON delegates FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON representatives FOR ALL USING (auth.role() = 'authenticated');
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
CREATE TRIGGER update_representatives_updated_at BEFORE UPDATE ON representatives FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data (optional - for testing)
INSERT INTO delegates (name, email, phone, role, status, current_location, notes) VALUES
('Mike Johnson', 'mike.johnson@company.com', '+1 (555) 123-4567', 'driver', 'available', 'Downtown', '{"vehicle": "VH-001", "license_number": "DL123456789", "coverage_areas": ["Downtown", "Business District"]}'),
('Sarah Wilson', 'sarah.wilson@company.com', '+1 (555) 234-5678', 'supervisor', 'busy', 'North Zone', '{"specializations": ["team_management", "quality_control"]}'),
('David Chen', 'david.chen@company.com', '+1 (555) 345-6789', 'technician', 'available', 'East District', '{"specializations": ["maintenance", "repairs"]}');

-- Sample representatives data
INSERT INTO representatives (id, name, email, phone, address, license_number, emergency_contact, vehicle, status, coverage_areas, transportation_type) VALUES
('REP-12345678', 'Ahmed Hassan', 'ahmed.hassan@company.com', '+1 (555) 456-7890', '123 Main St, Central Zone', 'DL987654321', 'Fatima Hassan +1 (555) 456-7891', 'VH-002', 'active', ARRAY['Central Zone', 'Residential Area'], 'vehicle'),
('REP-87654321', 'Sara Al-Mahmoud', 'sara.almahmoud@company.com', '+1 (555) 567-8901', '456 Oak Ave, North District', NULL, 'Mohammed Al-Mahmoud +1 (555) 567-8902', NULL, 'active', ARRAY['North District', 'Business Quarter'], 'foot');

-- Sample visits (optional - for testing)
INSERT INTO visits (delegate_id, delegate_name, customer_id, customer_name, customer_address, scheduled_start_time, scheduled_end_time, visit_type, priority, notes, allowed_duration_minutes) VALUES
('1', 'Mike Johnson', '1', 'ABC Corporation', '123 Business St, Downtown', NOW() + INTERVAL '2 hours', NOW() + INTERVAL '3 hours', 'delivery', 'high', 'Urgent delivery for VIP customer', 60),
('2', 'Sarah Wilson', '2', 'XYZ Industries', '456 Industrial Ave, North Zone', NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '30 minutes', 'inspection', 'medium', 'Regular maintenance inspection', 90),
('3', 'David Chen', '3', 'Tech Solutions Ltd', '789 Innovation Blvd, East District', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour', 'meeting', 'low', 'Client meeting to discuss new requirements', 60);

-- After-Sales Support Tables

-- Customer inquiries table
CREATE TABLE IF NOT EXISTS customer_inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    inquiry_type TEXT NOT NULL CHECK (inquiry_type IN ('general', 'technical', 'billing', 'warranty', 'complaint', 'maintenance')),
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'escalated')),
    assigned_to TEXT,
    assigned_to_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    response_time_hours INTEGER,
    customer_satisfaction_rating INTEGER CHECK (customer_satisfaction_rating >= 1 AND customer_satisfaction_rating <= 5),
    tags TEXT[] DEFAULT '{}',
    attachments TEXT[] DEFAULT '{}'
);

-- Complaints table
CREATE TABLE IF NOT EXISTS complaints (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    complaint_type TEXT NOT NULL CHECK (complaint_type IN ('product_quality', 'delivery_issue', 'service_quality', 'billing_error', 'communication', 'other')),
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'investigating', 'resolved', 'closed', 'escalated')),
    assigned_to TEXT,
    assigned_to_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    compensation_offered TEXT,
    customer_satisfaction_rating INTEGER CHECK (customer_satisfaction_rating >= 1 AND customer_satisfaction_rating <= 5),
    escalation_level INTEGER DEFAULT 0,
    related_orders TEXT[] DEFAULT '{}',
    attachments TEXT[] DEFAULT '{}'
);

-- Maintenance requests table
CREATE TABLE IF NOT EXISTS maintenance_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    equipment_id TEXT,
    equipment_name TEXT,
    request_type TEXT NOT NULL CHECK (request_type IN ('preventive', 'corrective', 'emergency', 'warranty', 'upgrade')),
    description TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'scheduled', 'in_progress', 'completed', 'cancelled')),
    assigned_technician TEXT,
    assigned_technician_name TEXT,
    scheduled_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    estimated_duration_hours INTEGER,
    actual_duration_hours INTEGER,
    cost_estimate DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    warranty_covered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    customer_satisfaction_rating INTEGER CHECK (customer_satisfaction_rating >= 1 AND customer_satisfaction_rating <= 5),
    service_notes TEXT,
    parts_used TEXT[] DEFAULT '{}',
    attachments TEXT[] DEFAULT '{}'
);

-- Warranties table
CREATE TABLE IF NOT EXISTS warranties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    order_id TEXT NOT NULL,
    warranty_type TEXT NOT NULL CHECK (warranty_type IN ('standard', 'extended', 'premium')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_months INTEGER NOT NULL,
    coverage_details TEXT NOT NULL,
    terms_conditions TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'void', 'transferred')),
    claims_count INTEGER DEFAULT 0,
    last_claim_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- Warranty claims table
CREATE TABLE IF NOT EXISTS warranty_claims (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    warranty_id UUID NOT NULL REFERENCES warranties(id) ON DELETE CASCADE,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    claim_type TEXT NOT NULL CHECK (claim_type IN ('repair', 'replacement', 'refund', 'service')),
    description TEXT NOT NULL,
    issue_details TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected', 'completed')),
    assigned_to TEXT,
    assigned_to_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    cost_covered DECIMAL(10,2) DEFAULT 0,
    customer_satisfaction_rating INTEGER CHECK (customer_satisfaction_rating >= 1 AND customer_satisfaction_rating <= 5),
    attachments TEXT[] DEFAULT '{}'
);

-- Follow-up services table
CREATE TABLE IF NOT EXISTS follow_up_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    service_type TEXT NOT NULL CHECK (service_type IN ('satisfaction_survey', 'product_training', 'maintenance_reminder', 'upgrade_offer', 'feedback_collection')),
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_date TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
    assigned_to TEXT,
    assigned_to_name TEXT,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    description TEXT NOT NULL,
    outcome TEXT,
    customer_satisfaction_rating INTEGER CHECK (customer_satisfaction_rating >= 1 AND customer_satisfaction_rating <= 5),
    follow_up_required BOOLEAN DEFAULT FALSE,
    next_follow_up_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- Support agents table
CREATE TABLE IF NOT EXISTS support_agents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('support_agent', 'senior_agent', 'team_lead', 'manager')),
    specializations TEXT[] DEFAULT '{}',
    current_workload INTEGER DEFAULT 0,
    max_workload INTEGER DEFAULT 10,
    performance_rating DECIMAL(3,2) DEFAULT 0.0,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for after-sales support tables
CREATE INDEX IF NOT EXISTS idx_customer_inquiries_customer_id ON customer_inquiries(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_inquiries_status ON customer_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_customer_inquiries_priority ON customer_inquiries(priority);
CREATE INDEX IF NOT EXISTS idx_customer_inquiries_created_at ON customer_inquiries(created_at);
CREATE INDEX IF NOT EXISTS idx_customer_inquiries_assigned_to ON customer_inquiries(assigned_to);

CREATE INDEX IF NOT EXISTS idx_complaints_customer_id ON complaints(customer_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_severity ON complaints(severity);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at);
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_to ON complaints(assigned_to);

CREATE INDEX IF NOT EXISTS idx_maintenance_requests_customer_id ON maintenance_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_priority ON maintenance_requests(priority);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_assigned_technician ON maintenance_requests(assigned_technician);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_scheduled_date ON maintenance_requests(scheduled_date);

CREATE INDEX IF NOT EXISTS idx_warranties_customer_id ON warranties(customer_id);
CREATE INDEX IF NOT EXISTS idx_warranties_status ON warranties(status);
CREATE INDEX IF NOT EXISTS idx_warranties_end_date ON warranties(end_date);

CREATE INDEX IF NOT EXISTS idx_warranty_claims_warranty_id ON warranty_claims(warranty_id);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_status ON warranty_claims(status);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_created_at ON warranty_claims(created_at);

CREATE INDEX IF NOT EXISTS idx_follow_up_services_customer_id ON follow_up_services(customer_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_services_status ON follow_up_services(status);
CREATE INDEX IF NOT EXISTS idx_follow_up_services_scheduled_date ON follow_up_services(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_follow_up_services_assigned_to ON follow_up_services(assigned_to);

-- RLS policies for after-sales support tables
ALTER TABLE customer_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranties ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users" ON customer_inquiries FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON complaints FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON maintenance_requests FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON warranties FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON warranty_claims FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON follow_up_services FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON support_agents FOR ALL USING (auth.role() = 'authenticated');

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_customer_inquiries_updated_at BEFORE UPDATE ON customer_inquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON complaints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_requests_updated_at BEFORE UPDATE ON maintenance_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_warranties_updated_at BEFORE UPDATE ON warranties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_warranty_claims_updated_at BEFORE UPDATE ON warranty_claims FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_follow_up_services_updated_at BEFORE UPDATE ON follow_up_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_support_agents_updated_at BEFORE UPDATE ON support_agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample after-sales support data (optional - for testing)
INSERT INTO support_agents (name, email, phone, role, specializations, current_workload, max_workload, performance_rating) VALUES
('John Support', 'john.support@company.com', '+1 (555) 111-2222', 'support_agent', ARRAY['technical', 'billing'], 3, 10, 4.5),
('Sarah Manager', 'sarah.manager@company.com', '+1 (555) 333-4444', 'team_lead', ARRAY['complaints', 'escalations'], 2, 8, 4.8),
('Mike Technician', 'mike.technician@company.com', '+1 (555) 555-6666', 'support_agent', ARRAY['maintenance', 'warranty'], 1, 10, 4.2);

INSERT INTO customer_inquiries (customer_id, customer_name, customer_email, customer_phone, inquiry_type, subject, description, priority, status, assigned_to, assigned_to_name) VALUES
('1', 'ABC Corporation', 'contact@abccorp.com', '+1 (555) 100-1000', 'technical', 'Product Installation Help', 'Need assistance with installing the new equipment', 'high', 'in_progress', '1', 'John Support'),
('2', 'XYZ Industries', 'support@xyzind.com', '+1 (555) 200-2000', 'billing', 'Invoice Question', 'Question about recent invoice charges', 'medium', 'open', NULL, NULL),
('3', 'Tech Solutions Ltd', 'help@techsol.com', '+1 (555) 300-3000', 'warranty', 'Warranty Claim', 'Product stopped working after 6 months', 'urgent', 'escalated', '2', 'Sarah Manager');

INSERT INTO complaints (customer_id, customer_name, customer_email, customer_phone, complaint_type, subject, description, severity, status, escalation_level, assigned_to, assigned_to_name) VALUES
('1', 'ABC Corporation', 'contact@abccorp.com', '+1 (555) 100-1000', 'service_quality', 'Poor Customer Service', 'Very disappointed with the support response time', 'high', 'investigating', 1, '2', 'Sarah Manager'),
('2', 'XYZ Industries', 'support@xyzind.com', '+1 (555) 200-2000', 'delivery_issue', 'Late Delivery', 'Order was delivered 3 days late', 'medium', 'resolved', 0, '1', 'John Support');

INSERT INTO maintenance_requests (customer_id, customer_name, customer_email, customer_phone, equipment_name, request_type, description, priority, status, assigned_technician, assigned_technician_name, scheduled_date, warranty_covered) VALUES
('1', 'ABC Corporation', 'contact@abccorp.com', '+1 (555) 100-1000', 'Industrial Press Machine', 'preventive', 'Regular maintenance check', 'medium', 'scheduled', '3', 'Mike Technician', NOW() + INTERVAL '1 week', true),
('2', 'XYZ Industries', 'support@xyzind.com', '+1 (555) 200-2000', 'Conveyor System', 'corrective', 'Belt replacement needed', 'high', 'in_progress', '3', 'Mike Technician', NOW(), false);

INSERT INTO warranties (customer_id, customer_name, product_id, product_name, order_id, warranty_type, start_date, end_date, duration_months, coverage_details, terms_conditions, status, claims_count) VALUES
('1', 'ABC Corporation', 'PROD-001', 'Industrial Press Machine', 'ORD-001', 'standard', NOW() - INTERVAL '6 months', NOW() + INTERVAL '18 months', 24, 'Full coverage for parts and labor', 'Standard warranty terms apply', 'active', 0),
('2', 'XYZ Industries', 'PROD-002', 'Conveyor System', 'ORD-002', 'extended', NOW() - INTERVAL '1 year', NOW() + INTERVAL '2 years', 36, 'Extended coverage with priority support', 'Extended warranty terms apply', 'active', 1);

INSERT INTO follow_up_services (customer_id, customer_name, customer_email, customer_phone, service_type, scheduled_date, status, assigned_to, assigned_to_name, priority, description, follow_up_required) VALUES
('1', 'ABC Corporation', 'contact@abccorp.com', '+1 (555) 100-1000', 'satisfaction_survey', NOW() + INTERVAL '1 month', 'scheduled', '1', 'John Support', 'medium', 'Post-installation satisfaction survey', true),
('2', 'XYZ Industries', 'support@xyzind.com', '+1 (555) 200-2000', 'maintenance_reminder', NOW() + INTERVAL '2 weeks', 'scheduled', '3', 'Mike Technician', 'high', 'Scheduled maintenance reminder', false);
