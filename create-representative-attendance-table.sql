-- Create representative attendance table
-- This table is specifically for tracking representative attendance/check-ins

CREATE TABLE IF NOT EXISTS representative_attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    representative_id TEXT NOT NULL REFERENCES representatives(id) ON DELETE CASCADE,
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_out_time TIMESTAMP WITH TIME ZONE,
    check_in_latitude DECIMAL(10, 8),
    check_in_longitude DECIMAL(11, 8),
    check_out_latitude DECIMAL(10, 8),
    check_out_longitude DECIMAL(11, 8),
    total_hours DECIMAL(4, 2),
    status TEXT NOT NULL DEFAULT 'checked_in' CHECK (status IN ('checked_in', 'checked_out', 'break')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_representative_attendance_representative_id 
    ON representative_attendance(representative_id);
CREATE INDEX IF NOT EXISTS idx_representative_attendance_check_in_time 
    ON representative_attendance(check_in_time);
CREATE INDEX IF NOT EXISTS idx_representative_attendance_status 
    ON representative_attendance(status);

-- Enable RLS
ALTER TABLE representative_attendance ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users" ON representative_attendance
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON representative_attendance
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON representative_attendance
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users" ON representative_attendance
    FOR DELETE USING (true);

-- Insert some sample data
INSERT INTO representative_attendance (representative_id, check_in_time, check_out_time, status, notes) VALUES
('REP001', NOW() - INTERVAL '2 hours', NULL, 'checked_in', 'Started shift'),
('REP002', NOW() - INTERVAL '1 hour', NULL, 'checked_in', 'Morning shift'),
('REP003', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '1 hour', 'checked_out', 'Completed delivery route');

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_representative_attendance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_representative_attendance_updated_at
    BEFORE UPDATE ON representative_attendance
    FOR EACH ROW
    EXECUTE FUNCTION update_representative_attendance_updated_at();
