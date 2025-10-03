-- After-Sales Support System Database Tables
-- This script creates all necessary tables for the after-sales support functionality

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Customer Inquiries Table
CREATE TABLE IF NOT EXISTS customer_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    inquiry_type VARCHAR(50) NOT NULL CHECK (inquiry_type IN ('general', 'technical', 'billing', 'warranty', 'complaint', 'maintenance')),
    subject VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'escalated')),
    assigned_to UUID,
    assigned_to_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    response_time_hours INTEGER,
    customer_satisfaction_rating INTEGER CHECK (customer_satisfaction_rating >= 1 AND customer_satisfaction_rating <= 5),
    tags TEXT[],
    attachments TEXT[]
);

-- 2. Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    complaint_type VARCHAR(50) NOT NULL CHECK (complaint_type IN ('product_quality', 'delivery_issue', 'service_quality', 'billing_error', 'communication', 'other')),
    subject VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'investigating', 'resolved', 'closed', 'escalated')),
    assigned_to UUID,
    assigned_to_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    compensation_offered TEXT,
    customer_satisfaction_rating INTEGER CHECK (customer_satisfaction_rating >= 1 AND customer_satisfaction_rating <= 5),
    escalation_level INTEGER DEFAULT 0,
    related_orders TEXT[],
    attachments TEXT[]
);

-- 3. Maintenance Requests Table
CREATE TABLE IF NOT EXISTS maintenance_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    equipment_id VARCHAR(255),
    equipment_name VARCHAR(255),
    request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('preventive', 'corrective', 'emergency', 'warranty', 'upgrade')),
    description TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'scheduled', 'in_progress', 'completed', 'cancelled')),
    assigned_technician UUID,
    assigned_technician_name VARCHAR(255),
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
    parts_used TEXT[],
    attachments TEXT[]
);

-- 4. Warranties Table
CREATE TABLE IF NOT EXISTS warranties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    product_id VARCHAR(255) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    order_id VARCHAR(255) NOT NULL,
    warranty_type VARCHAR(50) NOT NULL CHECK (warranty_type IN ('standard', 'extended', 'premium')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_months INTEGER NOT NULL,
    coverage_details TEXT NOT NULL,
    terms_conditions TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'void', 'transferred')),
    claims_count INTEGER DEFAULT 0,
    last_claim_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- 5. Warranty Claims Table
CREATE TABLE IF NOT EXISTS warranty_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warranty_id UUID NOT NULL REFERENCES warranties(id) ON DELETE CASCADE,
    customer_id VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    claim_type VARCHAR(50) NOT NULL CHECK (claim_type IN ('repair', 'replacement', 'refund', 'service')),
    description TEXT NOT NULL,
    issue_details TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected', 'completed')),
    assigned_to UUID,
    assigned_to_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    cost_covered DECIMAL(10,2) NOT NULL DEFAULT 0,
    customer_satisfaction_rating INTEGER CHECK (customer_satisfaction_rating >= 1 AND customer_satisfaction_rating <= 5),
    attachments TEXT[]
);

-- 6. Follow-up Services Table
CREATE TABLE IF NOT EXISTS follow_up_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('satisfaction_survey', 'product_training', 'maintenance_reminder', 'upgrade_offer', 'feedback_collection')),
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
    assigned_to UUID,
    assigned_to_name VARCHAR(255),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    description TEXT NOT NULL,
    outcome TEXT,
    customer_satisfaction_rating INTEGER CHECK (customer_satisfaction_rating >= 1 AND customer_satisfaction_rating <= 5),
    follow_up_required BOOLEAN DEFAULT FALSE,
    next_follow_up_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- 7. Support Agents Table
CREATE TABLE IF NOT EXISTS support_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL CHECK (role IN ('support_agent', 'senior_agent', 'team_lead', 'manager')),
    specializations TEXT[],
    current_workload INTEGER DEFAULT 0,
    max_workload INTEGER DEFAULT 10,
    performance_rating DECIMAL(3,2) DEFAULT 0.00,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_inquiries_customer_id ON customer_inquiries(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_inquiries_status ON customer_inquiries(status);
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
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_created_at ON maintenance_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_assigned_technician ON maintenance_requests(assigned_technician);

CREATE INDEX IF NOT EXISTS idx_warranties_customer_id ON warranties(customer_id);
CREATE INDEX IF NOT EXISTS idx_warranties_status ON warranties(status);
CREATE INDEX IF NOT EXISTS idx_warranties_product_id ON warranties(product_id);
CREATE INDEX IF NOT EXISTS idx_warranties_end_date ON warranties(end_date);

CREATE INDEX IF NOT EXISTS idx_warranty_claims_warranty_id ON warranty_claims(warranty_id);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_status ON warranty_claims(status);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_created_at ON warranty_claims(created_at);

CREATE INDEX IF NOT EXISTS idx_follow_up_services_customer_id ON follow_up_services(customer_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_services_status ON follow_up_services(status);
CREATE INDEX IF NOT EXISTS idx_follow_up_services_scheduled_date ON follow_up_services(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_follow_up_services_assigned_to ON follow_up_services(assigned_to);

CREATE INDEX IF NOT EXISTS idx_support_agents_email ON support_agents(email);
CREATE INDEX IF NOT EXISTS idx_support_agents_role ON support_agents(role);
CREATE INDEX IF NOT EXISTS idx_support_agents_is_available ON support_agents(is_available);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customer_inquiries_updated_at BEFORE UPDATE ON customer_inquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON complaints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_requests_updated_at BEFORE UPDATE ON maintenance_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_warranties_updated_at BEFORE UPDATE ON warranties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_warranty_claims_updated_at BEFORE UPDATE ON warranty_claims FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_follow_up_services_updated_at BEFORE UPDATE ON follow_up_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_support_agents_updated_at BEFORE UPDATE ON support_agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE customer_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranties ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_agents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for now - adjust based on your authentication system)
CREATE POLICY "Allow all operations on customer_inquiries" ON customer_inquiries FOR ALL USING (true);
CREATE POLICY "Allow all operations on complaints" ON complaints FOR ALL USING (true);
CREATE POLICY "Allow all operations on maintenance_requests" ON maintenance_requests FOR ALL USING (true);
CREATE POLICY "Allow all operations on warranties" ON warranties FOR ALL USING (true);
CREATE POLICY "Allow all operations on warranty_claims" ON warranty_claims FOR ALL USING (true);
CREATE POLICY "Allow all operations on follow_up_services" ON follow_up_services FOR ALL USING (true);
CREATE POLICY "Allow all operations on support_agents" ON support_agents FOR ALL USING (true);

-- Insert sample support agents
INSERT INTO support_agents (name, email, phone, role, specializations, max_workload, performance_rating) VALUES
('أحمد محمد', 'ahmed.mohamed@company.com', '+966501234567', 'senior_agent', ARRAY['technical_support', 'warranty_claims'], 15, 4.8),
('فاطمة علي', 'fatima.ali@company.com', '+966501234568', 'support_agent', ARRAY['customer_inquiries', 'complaints'], 10, 4.5),
('محمد السعيد', 'mohamed.alsaeed@company.com', '+966501234569', 'team_lead', ARRAY['maintenance_requests', 'follow_up_services'], 20, 4.9),
('نور الدين', 'nour.aldin@company.com', '+966501234570', 'manager', ARRAY['all'], 25, 5.0)
ON CONFLICT (email) DO NOTHING;

-- Insert sample data for demonstration
INSERT INTO customer_inquiries (customer_id, customer_name, customer_email, customer_phone, inquiry_type, subject, description, priority, status) VALUES
('customer_001', 'عبدالله أحمد', 'abdullah.ahmed@email.com', '+966501111111', 'technical', 'مشكلة في تشغيل الجهاز', 'الجهاز لا يعمل بشكل صحيح بعد التحديث الأخير', 'high', 'open'),
('customer_002', 'سارة محمد', 'sara.mohamed@email.com', '+966501111112', 'billing', 'استفسار حول الفاتورة', 'أريد توضيح حول الرسوم الإضافية في الفاتورة', 'medium', 'in_progress')
ON CONFLICT DO NOTHING;

INSERT INTO complaints (customer_id, customer_name, customer_email, customer_phone, complaint_type, subject, description, severity, status) VALUES
('customer_003', 'خالد عبدالرحمن', 'khalid.abdulrahman@email.com', '+966501111113', 'product_quality', 'جودة المنتج', 'المنتج وصل بحالة سيئة', 'high', 'new'),
('customer_004', 'مريم حسن', 'mariam.hassan@email.com', '+966501111114', 'delivery_issue', 'مشكلة في التسليم', 'التسليم تأخر عن الموعد المحدد', 'medium', 'investigating')
ON CONFLICT DO NOTHING;

INSERT INTO maintenance_requests (customer_id, customer_name, customer_email, customer_phone, equipment_name, request_type, description, priority, status) VALUES
('customer_005', 'علي محمود', 'ali.mahmoud@email.com', '+966501111115', 'مضخة المياه', 'preventive', 'صيانة دورية للمضخة', 'medium', 'requested'),
('customer_006', 'نورا سعد', 'nora.saad@email.com', '+966501111116', 'مولد الكهرباء', 'emergency', 'المولد توقف عن العمل', 'urgent', 'scheduled')
ON CONFLICT DO NOTHING;

INSERT INTO warranties (customer_id, customer_name, product_id, product_name, order_id, warranty_type, start_date, end_date, duration_months, coverage_details, terms_conditions, status) VALUES
('customer_007', 'يوسف أحمد', 'product_001', 'مضخة مياه صناعية', 'order_001', 'standard', NOW(), NOW() + INTERVAL '12 months', 12, 'تغطية كاملة للأجزاء والعمالة', 'الضمان يغطي الأعطال الطبيعية فقط', 'active'),
('customer_008', 'هند محمد', 'product_002', 'مولد كهرباء', 'order_002', 'extended', NOW(), NOW() + INTERVAL '24 months', 24, 'تغطية ممتدة لجميع الأجزاء', 'الضمان الممتد يشمل الصيانة الدورية', 'active')
ON CONFLICT DO NOTHING;

INSERT INTO follow_up_services (customer_id, customer_name, customer_email, customer_phone, service_type, scheduled_date, status, priority, description) VALUES
('customer_009', 'أحمد علي', 'ahmed.ali@email.com', '+966501111117', 'satisfaction_survey', NOW() + INTERVAL '7 days', 'scheduled', 'medium', 'استطلاع رضا العميل عن الخدمة'),
('customer_010', 'فاطمة حسن', 'fatima.hassan@email.com', '+966501111118', 'product_training', NOW() + INTERVAL '14 days', 'scheduled', 'high', 'تدريب العميل على استخدام المنتج الجديد')
ON CONFLICT DO NOTHING;

-- Create a view for after-sales metrics
CREATE OR REPLACE VIEW after_sales_metrics AS
SELECT 
    (SELECT COUNT(*) FROM customer_inquiries) as total_inquiries,
    (SELECT COUNT(*) FROM customer_inquiries WHERE status IN ('resolved', 'closed')) as resolved_inquiries,
    (SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) FROM customer_inquiries WHERE resolved_at IS NOT NULL) as average_resolution_time_hours,
    (SELECT AVG(customer_satisfaction_rating) FROM customer_inquiries WHERE customer_satisfaction_rating IS NOT NULL) as customer_satisfaction_score,
    (SELECT COUNT(*) FROM complaints) as total_complaints,
    (SELECT COUNT(*) FROM complaints WHERE status IN ('resolved', 'closed')) as resolved_complaints,
    (SELECT ROUND((COUNT(*) FILTER (WHERE escalation_level > 0)::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 2) FROM complaints) as complaint_escalation_rate,
    (SELECT COUNT(*) FROM maintenance_requests) as total_maintenance_requests,
    (SELECT COUNT(*) FROM maintenance_requests WHERE status = 'completed') as completed_maintenance_requests,
    (SELECT AVG(actual_cost) FROM maintenance_requests WHERE actual_cost IS NOT NULL) as average_maintenance_cost,
    (SELECT COUNT(*) FROM warranties WHERE status = 'active') as active_warranties,
    (SELECT COUNT(*) FROM warranty_claims) as warranty_claims_count,
    (SELECT ROUND((COUNT(*) FILTER (WHERE status = 'approved')::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 2) FROM warranty_claims) as warranty_claim_approval_rate,
    (SELECT COUNT(*) FROM follow_up_services) as scheduled_follow_ups,
    (SELECT COUNT(*) FROM follow_up_services WHERE status = 'completed') as completed_follow_ups,
    85.0 as customer_retention_rate;

-- Grant necessary permissions (adjust based on your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

COMMENT ON TABLE customer_inquiries IS 'Customer inquiries and support requests';
COMMENT ON TABLE complaints IS 'Customer complaints and issues';
COMMENT ON TABLE maintenance_requests IS 'Equipment maintenance and service requests';
COMMENT ON TABLE warranties IS 'Product warranties and coverage';
COMMENT ON TABLE warranty_claims IS 'Warranty claims and requests';
COMMENT ON TABLE follow_up_services IS 'Customer follow-up and satisfaction services';
COMMENT ON TABLE support_agents IS 'Support team members and agents';

-- Success message
SELECT 'After-sales support tables created successfully!' as message;
