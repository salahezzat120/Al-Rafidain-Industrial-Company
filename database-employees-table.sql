-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    position TEXT NOT NULL,
    department TEXT NOT NULL,
    hire_date DATE NOT NULL,
    salary DECIMAL(10,2),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
    avatar_url TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    address TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    nationality TEXT,
    passport_number TEXT,
    work_permit_expiry DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employee_permissions table
CREATE TABLE IF NOT EXISTS employee_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    task_type TEXT NOT NULL,
    permission_level TEXT NOT NULL DEFAULT 'read' CHECK (permission_level IN ('read', 'write', 'admin')),
    granted_by UUID REFERENCES employees(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_out_time TIMESTAMP WITH TIME ZONE,
    break_start_time TIMESTAMP WITH TIME ZONE,
    break_end_time TIMESTAMP WITH TIME ZONE,
    total_hours DECIMAL(4,2),
    overtime_hours DECIMAL(4,2) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'half_day', 'sick_leave', 'vacation')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create performance_reviews table
CREATE TABLE IF NOT EXISTS performance_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    review_period_start DATE NOT NULL,
    review_period_end DATE NOT NULL,
    overall_rating DECIMAL(3,2) CHECK (overall_rating >= 0 AND overall_rating <= 5),
    punctuality_rating DECIMAL(3,2) CHECK (punctuality_rating >= 0 AND punctuality_rating <= 5),
    work_quality_rating DECIMAL(3,2) CHECK (work_quality_rating >= 0 AND work_quality_rating <= 5),
    teamwork_rating DECIMAL(3,2) CHECK (teamwork_rating >= 0 AND teamwork_rating <= 5),
    communication_rating DECIMAL(3,2) CHECK (communication_rating >= 0 AND communication_rating <= 5),
    goals_achieved INTEGER DEFAULT 0,
    goals_total INTEGER DEFAULT 0,
    strengths TEXT,
    areas_for_improvement TEXT,
    manager_notes TEXT,
    employee_notes TEXT,
    reviewed_by UUID REFERENCES employees(id),
    review_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations for employees" ON employees FOR ALL USING (true);
CREATE POLICY "Allow all operations for employee_permissions" ON employee_permissions FOR ALL USING (true);
CREATE POLICY "Allow all operations for attendance" ON attendance FOR ALL USING (true);
CREATE POLICY "Allow all operations for performance_reviews" ON performance_reviews FOR ALL USING (true);

-- Create indexes
CREATE INDEX idx_employees_employee_id ON employees(employee_id);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employee_permissions_employee_id ON employee_permissions(employee_id);
CREATE INDEX idx_employee_permissions_task_type ON employee_permissions(task_type);
CREATE INDEX idx_attendance_employee_id ON attendance(employee_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_performance_reviews_employee_id ON performance_reviews(employee_id);
CREATE INDEX idx_performance_reviews_period ON performance_reviews(review_period_start, review_period_end);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employee_permissions_updated_at BEFORE UPDATE ON employee_permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_performance_reviews_updated_at BEFORE UPDATE ON performance_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO employees (employee_id, first_name, last_name, email, phone, position, department, hire_date, salary, status, address, date_of_birth, gender, nationality) VALUES
('EMP001', 'Ahmed', 'Hassan', 'ahmed.hassan@company.com', '+964-770-123-4567', 'Senior Developer', 'IT', '2023-01-15', 2500.00, 'active', 'Baghdad, Iraq', '1990-05-20', 'male', 'Iraqi'),
('EMP002', 'Fatima', 'Ali', 'fatima.ali@company.com', '+964-770-234-5678', 'HR Manager', 'Human Resources', '2022-08-10', 3000.00, 'active', 'Erbil, Iraq', '1988-12-15', 'female', 'Iraqi'),
('EMP003', 'Omar', 'Mahmoud', 'omar.mahmoud@company.com', '+964-770-345-6789', 'Sales Executive', 'Sales', '2023-03-20', 2000.00, 'active', 'Basra, Iraq', '1992-07-08', 'male', 'Iraqi'),
('EMP004', 'Layla', 'Ahmed', 'layla.ahmed@company.com', '+964-770-456-7890', 'Accountant', 'Finance', '2022-11-05', 2200.00, 'active', 'Mosul, Iraq', '1991-09-25', 'female', 'Iraqi'),
('EMP005', 'Khalid', 'Ibrahim', 'khalid.ibrahim@company.com', '+964-770-567-8901', 'Driver', 'Logistics', '2023-06-12', 1500.00, 'active', 'Najaf, Iraq', '1989-03-18', 'male', 'Iraqi');

-- Insert sample permissions
INSERT INTO employee_permissions (employee_id, task_type, permission_level, granted_by) VALUES
((SELECT id FROM employees WHERE employee_id = 'EMP001'), 'customer_management', 'admin', (SELECT id FROM employees WHERE employee_id = 'EMP002')),
((SELECT id FROM employees WHERE employee_id = 'EMP001'), 'order_management', 'write', (SELECT id FROM employees WHERE employee_id = 'EMP002')),
((SELECT id FROM employees WHERE employee_id = 'EMP002'), 'employee_management', 'admin', (SELECT id FROM employees WHERE employee_id = 'EMP002')),
((SELECT id FROM employees WHERE employee_id = 'EMP003'), 'customer_management', 'read', (SELECT id FROM employees WHERE employee_id = 'EMP002')),
((SELECT id FROM employees WHERE employee_id = 'EMP003'), 'sales_reporting', 'write', (SELECT id FROM employees WHERE employee_id = 'EMP002')),
((SELECT id FROM employees WHERE employee_id = 'EMP004'), 'financial_reporting', 'write', (SELECT id FROM employees WHERE employee_id = 'EMP002')),
((SELECT id FROM employees WHERE employee_id = 'EMP005'), 'delivery_tracking', 'read', (SELECT id FROM employees WHERE employee_id = 'EMP002'));

-- Insert sample attendance
INSERT INTO attendance (employee_id, date, check_in_time, check_out_time, total_hours, status) VALUES
((SELECT id FROM employees WHERE employee_id = 'EMP001'), '2024-01-15', '2024-01-15 08:00:00', '2024-01-15 17:00:00', 8.0, 'present'),
((SELECT id FROM employees WHERE employee_id = 'EMP001'), '2024-01-16', '2024-01-16 08:15:00', '2024-01-16 17:30:00', 8.25, 'late'),
((SELECT id FROM employees WHERE employee_id = 'EMP002'), '2024-01-15', '2024-01-15 08:00:00', '2024-01-15 17:00:00', 8.0, 'present'),
((SELECT id FROM employees WHERE employee_id = 'EMP003'), '2024-01-15', '2024-01-15 08:00:00', '2024-01-15 17:00:00', 8.0, 'present'),
((SELECT id FROM employees WHERE employee_id = 'EMP004'), '2024-01-15', '2024-01-15 08:00:00', '2024-01-15 17:00:00', 8.0, 'present'),
((SELECT id FROM employees WHERE employee_id = 'EMP005'), '2024-01-15', '2024-01-15 08:00:00', '2024-01-15 17:00:00', 8.0, 'present');

-- Insert sample performance reviews
INSERT INTO performance_reviews (employee_id, review_period_start, review_period_end, overall_rating, punctuality_rating, work_quality_rating, teamwork_rating, communication_rating, goals_achieved, goals_total, strengths, areas_for_improvement, manager_notes) VALUES
((SELECT id FROM employees WHERE employee_id = 'EMP001'), '2023-01-01', '2023-12-31', 4.5, 4.0, 5.0, 4.5, 4.0, 8, 10, 'Excellent technical skills, proactive problem solving', 'Time management, communication with non-technical staff', 'Outstanding performance this year. Recommended for promotion.'),
((SELECT id FROM employees WHERE employee_id = 'EMP002'), '2023-01-01', '2023-12-31', 4.8, 5.0, 4.5, 5.0, 4.5, 9, 10, 'Strong leadership, excellent people management', 'Technical knowledge could be improved', 'Exceptional HR management. Great team builder.'),
((SELECT id FROM employees WHERE employee_id = 'EMP003'), '2023-01-01', '2023-12-31', 4.2, 4.0, 4.0, 4.5, 4.5, 7, 10, 'Great customer relationships, strong sales skills', 'Follow-up processes, documentation', 'Good sales performance. Room for improvement in processes.');
