-- Movement Tracking Database Schema
-- This file contains the database schema for representative movement tracking

-- Representative movements table
CREATE TABLE IF NOT EXISTS representative_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    representative_id TEXT NOT NULL REFERENCES representatives(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    location_name VARCHAR(255),
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN (
        'check_in', 'check_out', 'delivery_start', 'delivery_complete', 
        'break_start', 'break_end', 'location_update', 'visit_start', 
        'visit_end', 'task_start', 'task_complete', 'idle'
    )),
    description TEXT,
    duration_minutes INTEGER,
    distance_km DECIMAL(8,2),
    speed_kmh INTEGER,
    heading_degrees INTEGER,
    accuracy_meters INTEGER,
    battery_level INTEGER,
    is_charging BOOLEAN DEFAULT FALSE,
    network_type VARCHAR(50),
    device_info JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Representative visits table (for tracking specific visits)
CREATE TABLE IF NOT EXISTS representative_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    representative_id TEXT NOT NULL REFERENCES representatives(id) ON DELETE CASCADE,
    visit_type VARCHAR(50) NOT NULL CHECK (visit_type IN (
        'customer_visit', 'delivery', 'pickup', 'maintenance', 'inspection', 'meeting'
    )),
    customer_name VARCHAR(255),
    customer_address TEXT,
    customer_phone VARCHAR(20),
    visit_purpose TEXT,
    scheduled_start_time TIMESTAMP WITH TIME ZONE,
    scheduled_end_time TIMESTAMP WITH TIME ZONE,
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN (
        'scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'
    )),
    notes TEXT,
    photos JSONB,
    signatures JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Representative daily summaries table
CREATE TABLE IF NOT EXISTS representative_daily_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    representative_id TEXT NOT NULL REFERENCES representatives(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_distance_km DECIMAL(8,2) DEFAULT 0,
    total_duration_hours DECIMAL(4,2) DEFAULT 0,
    total_visits INTEGER DEFAULT 0,
    completed_visits INTEGER DEFAULT 0,
    total_deliveries INTEGER DEFAULT 0,
    completed_deliveries INTEGER DEFAULT 0,
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_out_time TIMESTAMP WITH TIME ZONE,
    break_duration_minutes INTEGER DEFAULT 0,
    idle_duration_minutes INTEGER DEFAULT 0,
    fuel_consumed_liters DECIMAL(6,2),
    expenses DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(representative_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_movements_representative_id ON representative_movements(representative_id);
CREATE INDEX IF NOT EXISTS idx_movements_created_at ON representative_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_movements_activity_type ON representative_movements(activity_type);
CREATE INDEX IF NOT EXISTS idx_movements_date ON representative_movements(DATE(created_at));

CREATE INDEX IF NOT EXISTS idx_visits_representative_id ON representative_visits(representative_id);
CREATE INDEX IF NOT EXISTS idx_visits_scheduled_start ON representative_visits(scheduled_start_time);
CREATE INDEX IF NOT EXISTS idx_visits_status ON representative_visits(status);
CREATE INDEX IF NOT EXISTS idx_visits_date ON representative_visits(DATE(created_at));

CREATE INDEX IF NOT EXISTS idx_summaries_representative_id ON representative_daily_summaries(representative_id);
CREATE INDEX IF NOT EXISTS idx_summaries_date ON representative_daily_summaries(date);

-- Create triggers for updated_at
CREATE TRIGGER update_movements_updated_at 
    BEFORE UPDATE ON representative_movements 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visits_updated_at 
    BEFORE UPDATE ON representative_visits 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_summaries_updated_at 
    BEFORE UPDATE ON representative_daily_summaries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample movement data
INSERT INTO representative_movements (
    representative_id, latitude, longitude, location_name, activity_type, 
    description, duration_minutes, distance_km, speed_kmh, accuracy_meters
) VALUES
('REP-12345678', 24.7136, 46.6753, 'Downtown Riyadh', 'check_in', 'Started work day', 0, 0, 0, 5),
('REP-12345678', 24.7200, 46.6800, 'Customer A Location', 'delivery_start', 'Started delivery to Customer A', 15, 2.5, 25, 3),
('REP-12345678', 24.7200, 46.6800, 'Customer A Location', 'delivery_complete', 'Completed delivery to Customer A', 30, 0, 0, 3),
('REP-12345678', 24.7300, 46.6900, 'Customer B Location', 'visit_start', 'Started visit to Customer B', 45, 3.2, 20, 4),
('REP-12345678', 24.7300, 46.6900, 'Customer B Location', 'visit_end', 'Completed visit to Customer B', 60, 0, 0, 4),
('REP-12345678', 24.7136, 46.6753, 'Downtown Riyadh', 'check_out', 'Ended work day', 0, 2.1, 15, 5);

-- Insert sample visit data
INSERT INTO representative_visits (
    representative_id, visit_type, customer_name, customer_address, 
    visit_purpose, scheduled_start_time, scheduled_end_time, 
    actual_start_time, actual_end_time, status
) VALUES
('REP-12345678', 'customer_visit', 'Ahmed Al-Rashid', '123 King Fahd Road, Riyadh', 
 'Product demonstration', '2024-01-20 09:00:00+03', '2024-01-20 10:00:00+03',
 '2024-01-20 09:15:00+03', '2024-01-20 10:30:00+03', 'completed'),
('REP-12345678', 'delivery', 'Sara Al-Mahmoud', '456 Prince Mohammed St, Riyadh',
 'Package delivery', '2024-01-20 11:00:00+03', '2024-01-20 11:30:00+03',
 '2024-01-20 11:05:00+03', '2024-01-20 11:25:00+03', 'completed');

-- Insert sample daily summary
INSERT INTO representative_daily_summaries (
    representative_id, date, total_distance_km, total_duration_hours, 
    total_visits, completed_visits, check_in_time, check_out_time
) VALUES
('REP-12345678', '2024-01-20', 7.8, 8.5, 2, 2, 
 '2024-01-20 08:00:00+03', '2024-01-20 16:30:00+03');
