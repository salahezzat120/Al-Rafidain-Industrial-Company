-- Delivery Tasks Management Schema for Al-Rafidain Industrial Company

-- 1. Delivery Tasks Table
CREATE TABLE delivery_tasks (
    id SERIAL PRIMARY KEY,
    task_id VARCHAR(50) UNIQUE NOT NULL, -- e.g., T001, T002
    title VARCHAR(255) NOT NULL,
    description TEXT,
    customer_id VARCHAR(50) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_address TEXT NOT NULL,
    customer_phone VARCHAR(50),
    representative_id VARCHAR(50), -- Can be null if unassigned
    representative_name VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in-progress', 'completed', 'cancelled')),
    priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    estimated_duration VARCHAR(20), -- e.g., '30 mins', '1 hour'
    scheduled_for TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    notes TEXT,
    total_value DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'IQD'
);

-- 2. Task Items Table (for selected products)
CREATE TABLE task_items (
    id SERIAL PRIMARY KEY,
    task_id VARCHAR(50) NOT NULL REFERENCES delivery_tasks(task_id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_code VARCHAR(50),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    unit_of_measurement VARCHAR(50),
    warehouse_id INTEGER,
    warehouse_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Task Status History Table (for tracking status changes)
CREATE TABLE task_status_history (
    id SERIAL PRIMARY KEY,
    task_id VARCHAR(50) NOT NULL REFERENCES delivery_tasks(task_id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    changed_by VARCHAR(255),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- Create indexes for better performance
CREATE INDEX idx_delivery_tasks_customer_id ON delivery_tasks(customer_id);
CREATE INDEX idx_delivery_tasks_representative_id ON delivery_tasks(representative_id);
CREATE INDEX idx_delivery_tasks_status ON delivery_tasks(status);
CREATE INDEX idx_delivery_tasks_priority ON delivery_tasks(priority);
CREATE INDEX idx_delivery_tasks_scheduled_for ON delivery_tasks(scheduled_for);
CREATE INDEX idx_delivery_tasks_created_at ON delivery_tasks(created_at);

CREATE INDEX idx_task_items_task_id ON task_items(task_id);
CREATE INDEX idx_task_items_product_id ON task_items(product_id);

CREATE INDEX idx_task_status_history_task_id ON task_status_history(task_id);
CREATE INDEX idx_task_status_history_changed_at ON task_status_history(changed_at);

-- Insert some sample data
INSERT INTO delivery_tasks (
    task_id, title, description, customer_id, customer_name, customer_address, customer_phone,
    representative_id, representative_name, status, priority, estimated_duration, scheduled_for,
    created_by, notes, total_value, currency
) VALUES 
(
    'T001', 
    'Electronics Delivery', 
    'Delivery of electronic equipment to downtown office',
    'C001', 
    'John Doe', 
    '123 Main St, Downtown, Baghdad 10001', 
    '+964 770 123 4567',
    '1', 
    'Mike Johnson', 
    'in-progress', 
    'high', 
    '45 mins', 
    '2024-01-16 10:30:00',
    'admin',
    'Handle with care - fragile items',
    125000.00,
    'IQD'
),
(
    'T002', 
    'Grocery Delivery', 
    'Fresh produce and groceries delivery',
    'C002', 
    'Jane Smith', 
    '456 Oak Ave, North Zone, Baghdad 10002', 
    '+964 770 234 5678',
    '2', 
    'Sarah Wilson', 
    'assigned', 
    'medium', 
    '30 mins', 
    '2024-01-16 11:00:00',
    'admin',
    'Customer prefers contactless delivery',
    85000.00,
    'IQD'
),
(
    'T003', 
    'Document Delivery', 
    'Urgent document delivery to government office',
    'C003', 
    'Bob Johnson', 
    '789 Pine Rd, East District, Baghdad 10003', 
    '+964 770 345 6789',
    NULL, 
    NULL, 
    'pending', 
    'urgent', 
    '20 mins', 
    '2024-01-16 09:00:00',
    'admin',
    'Urgent - deliver before 10 AM',
    0.00,
    'IQD'
);

-- Insert sample task items
INSERT INTO task_items (
    task_id, product_id, product_name, product_code, quantity, unit_price, total_price, 
    unit_of_measurement, warehouse_id, warehouse_name
) VALUES 
('T001', 1, 'Industrial Steel Pipes', 'ISP-001', 2, 25000.00, 50000.00, 'meters', 1, 'Main Warehouse'),
('T001', 2, 'Aluminum Sheets', 'ALS-002', 3, 18000.00, 54000.00, 'sheets', 1, 'Main Warehouse'),
('T001', 3, 'Copper Wire', 'CW-003', 1, 12000.00, 12000.00, 'meters', 1, 'Main Warehouse'),
('T001', 4, 'Industrial Valves', 'IV-004', 1, 35000.00, 35000.00, 'pieces', 2, 'North Warehouse'),

('T002', 2, 'Aluminum Sheets', 'ALS-002', 2, 18000.00, 36000.00, 'sheets', 1, 'Main Warehouse'),
('T002', 5, 'Steel Beams', 'SB-005', 1, 45000.00, 45000.00, 'pieces', 1, 'Main Warehouse'),
('T002', 7, 'Aluminum Frames', 'AF-007', 1, 22000.00, 22000.00, 'pieces', 3, 'South Warehouse');

-- Insert sample status history
INSERT INTO task_status_history (task_id, status, changed_by, notes) VALUES 
('T001', 'pending', 'admin', 'Task created'),
('T001', 'assigned', 'admin', 'Assigned to Mike Johnson'),
('T001', 'in-progress', 'Mike Johnson', 'Started delivery'),

('T002', 'pending', 'admin', 'Task created'),
('T002', 'assigned', 'admin', 'Assigned to Sarah Wilson'),

('T003', 'pending', 'admin', 'Task created - urgent delivery');
