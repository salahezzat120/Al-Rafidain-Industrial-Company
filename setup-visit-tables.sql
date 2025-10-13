-- Setup Visit Tables for Representative Visit Reports
-- This script creates the necessary tables for storing representative visits

-- Create representative_visits table
CREATE TABLE IF NOT EXISTS representative_visits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    representative_id TEXT NOT NULL,
    visit_type VARCHAR(50) NOT NULL CHECK (visit_type IN (
        'customer_visit', 'delivery', 'pickup', 'maintenance', 'inspection', 'meeting'
    )),
    customer_name VARCHAR(255) NOT NULL,
    customer_address TEXT NOT NULL,
    customer_phone VARCHAR(20),
    visit_purpose TEXT,
    scheduled_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN (
        'scheduled', 'in_progress', 'completed', 'cancelled', 'no_show', 'late'
    )),
    notes TEXT,
    photos JSONB,
    signatures JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create visits table (fallback)
CREATE TABLE IF NOT EXISTS visits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    delegate_id TEXT NOT NULL,
    delegate_name TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    customer_phone VARCHAR(20),
    scheduled_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'late', 'no_show')),
    visit_type TEXT NOT NULL DEFAULT 'delivery' CHECK (visit_type IN ('delivery', 'pickup', 'inspection', 'maintenance', 'meeting', 'customer_visit')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    notes TEXT,
    allowed_duration_minutes INTEGER NOT NULL DEFAULT 60,
    is_late BOOLEAN DEFAULT FALSE,
    exceeds_time_limit BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_representative_visits_representative_id ON representative_visits(representative_id);
CREATE INDEX IF NOT EXISTS idx_representative_visits_status ON representative_visits(status);
CREATE INDEX IF NOT EXISTS idx_representative_visits_created_at ON representative_visits(created_at);
CREATE INDEX IF NOT EXISTS idx_visits_delegate_id ON visits(delegate_id);
CREATE INDEX IF NOT EXISTS idx_visits_status ON visits(status);
CREATE INDEX IF NOT EXISTS idx_visits_created_at ON visits(created_at);

-- Insert sample visit data for testing
INSERT INTO representative_visits (
    representative_id, visit_type, customer_name, customer_address, customer_phone,
    scheduled_start_time, scheduled_end_time, actual_start_time, actual_end_time,
    status, notes
) VALUES 
-- Visits for صلاح عزت (REP-472788)
('REP-472788', 'customer_visit', 'شركة النخيل التجارية', 'شارع الملك فهد، الرياض', '0112345678',
 '2024-01-15 09:00:00+03', '2024-01-15 10:00:00+03', '2024-01-15 09:15:00+03', '2024-01-15 10:30:00+03',
 'completed', 'Successful product demonstration and order placement'),
 
('REP-472788', 'delivery', 'مؤسسة الصفا الصناعية', 'المنطقة الصناعية الثانية، جدة', '0123456789',
 '2024-01-15 14:00:00+03', '2024-01-15 15:00:00+03', '2024-01-15 14:00:00+03', '2024-01-15 14:45:00+03',
 'completed', 'Delivery completed successfully'),
 
('REP-472788', 'meeting', 'شركة الأمل للتجارة', 'شارع العليا، الرياض', '0111111111',
 '2024-01-16 10:00:00+03', '2024-01-16 11:00:00+03', NULL, NULL,
 'no_show', 'Client did not show up for scheduled meeting'),
 
('REP-472788', 'inspection', 'مصنع الخليج للمنتجات', 'الدمام الصناعية', '0133333333',
 '2024-01-16 15:00:00+03', '2024-01-16 16:00:00+03', '2024-01-16 15:30:00+03', NULL,
 'in_progress', 'Inspection in progress'),

-- Visits for احمد جعفر (REP-279170)
('REP-279170', 'customer_visit', 'شركة التقنية المتقدمة', 'حي النرجس، الرياض', '0114444444',
 '2024-01-15 10:00:00+03', '2024-01-15 11:00:00+03', '2024-01-15 10:05:00+03', '2024-01-15 11:15:00+03',
 'completed', 'Technical consultation and equipment demonstration'),
 
('REP-279170', 'delivery', 'مؤسسة البناء الحديث', 'شارع التحلية، جدة', '0125555555',
 '2024-01-15 16:00:00+03', '2024-01-15 17:00:00+03', '2024-01-15 16:10:00+03', '2024-01-15 16:50:00+03',
 'completed', 'Equipment delivery and installation guidance'),
 
('REP-279170', 'maintenance', 'شركة الإنتاج الصناعي', 'المنطقة الصناعية الأولى، الدمام', '0136666666',
 '2024-01-16 08:00:00+03', '2024-01-16 09:00:00+03', NULL, NULL,
 'cancelled', 'Maintenance cancelled due to equipment unavailability'),

-- Visits for احمد الدمراوي (REP-319646)
('REP-319646', 'customer_visit', 'مجموعة الأعمال التجارية', 'حي الملز، الرياض', '0117777777',
 '2024-01-15 11:00:00+03', '2024-01-15 12:00:00+03', '2024-01-15 11:20:00+03', '2024-01-15 12:30:00+03',
 'completed', 'Business partnership discussion and contract review'),
 
('REP-319646', 'pickup', 'شركة النقل السريع', 'شارع العليا، الرياض', '0118888888',
 '2024-01-15 15:00:00+03', '2024-01-15 16:00:00+03', '2024-01-15 15:15:00+03', '2024-01-15 15:45:00+03',
 'completed', 'Document pickup and delivery coordination'),
 
('REP-319646', 'meeting', 'مؤسسة الاستثمار العقاري', 'حي النرجس، الرياض', '0119999999',
 '2024-01-16 09:00:00+03', '2024-01-16 10:00:00+03', '2024-01-16 09:10:00+03', '2024-01-16 10:20:00+03',
 'completed', 'Property investment consultation and documentation'),
 
('REP-319646', 'inspection', 'شركة التصنيع المتقدم', 'المنطقة الصناعية الثالثة، جدة', '0120000000',
 '2024-01-16 14:00:00+03', '2024-01-16 15:00:00+03', NULL, NULL,
 'scheduled', 'Scheduled for equipment inspection and quality assessment');

-- Insert sample data into visits table as well (fallback)
INSERT INTO visits (
    delegate_id, delegate_name, customer_id, customer_name, customer_address, customer_phone,
    scheduled_start_time, scheduled_end_time, actual_start_time, actual_end_time,
    status, visit_type, notes
) VALUES 
('REP-472788', 'صلاح عزت', 'CUST-001', 'شركة النخيل التجارية', 'شارع الملك فهد، الرياض', '0112345678',
 '2024-01-15 09:00:00+03', '2024-01-15 10:00:00+03', '2024-01-15 09:15:00+03', '2024-01-15 10:30:00+03',
 'completed', 'customer_visit', 'Successful product demonstration and order placement'),
 
('REP-279170', 'احمد جعفر', 'CUST-002', 'شركة التقنية المتقدمة', 'حي النرجس، الرياض', '0114444444',
 '2024-01-15 10:00:00+03', '2024-01-15 11:00:00+03', '2024-01-15 10:05:00+03', '2024-01-15 11:15:00+03',
 'completed', 'customer_visit', 'Technical consultation and equipment demonstration'),
 
('REP-319646', 'احمد الدمراوي', 'CUST-003', 'مجموعة الأعمال التجارية', 'حي الملز، الرياض', '0117777777',
 '2024-01-15 11:00:00+03', '2024-01-15 12:00:00+03', '2024-01-15 11:20:00+03', '2024-01-15 12:30:00+03',
 'completed', 'customer_visit', 'Business partnership discussion and contract review');

-- Create updated_at trigger for representative_visits
CREATE OR REPLACE FUNCTION update_representative_visits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_representative_visits_updated_at
    BEFORE UPDATE ON representative_visits
    FOR EACH ROW
    EXECUTE FUNCTION update_representative_visits_updated_at();

-- Create updated_at trigger for visits
CREATE OR REPLACE FUNCTION update_visits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_visits_updated_at
    BEFORE UPDATE ON visits
    FOR EACH ROW
    EXECUTE FUNCTION update_visits_updated_at();
