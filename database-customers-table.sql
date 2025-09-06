-- Customers table for Al-Rafidain Industrial Company
-- This table stores customer information with GPS coordinates and visit tracking

CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id TEXT NOT NULL UNIQUE, -- Custom customer ID like C001, C002
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'vip', 'inactive')),
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    last_order_date DATE,
    rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    preferred_delivery_time TEXT DEFAULT 'Flexible',
    avatar_url TEXT,
    join_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    -- GPS/Geolocation fields
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    -- Visit tracking fields
    visit_status TEXT NOT NULL DEFAULT 'not_visited' CHECK (visit_status IN ('visited', 'not_visited')),
    last_visit_date DATE,
    visit_notes TEXT,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_customer_id ON customers(customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_visit_status ON customers(visit_status);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);

-- RLS (Row Level Security) policies
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON customers FOR ALL USING (auth.role() = 'authenticated');

-- Function for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_customers_updated_at();

-- Sample customers data (optional - for testing)
INSERT INTO customers (
    customer_id, name, email, phone, address, status, total_orders, total_spent, 
    last_order_date, rating, preferred_delivery_time, join_date, notes,
    latitude, longitude, visit_status, last_visit_date, visit_notes
) VALUES
('C001', 'John Doe', 'john.doe@email.com', '+1 (555) 123-4567', '123 Main St, Downtown, City 12345', 'active', 45, 2340.50, '2024-01-15', 4.8, 'Morning (9-12 PM)', '2023-06-15', 'Prefers contactless delivery', 33.3152, 44.3661, 'visited', '2024-01-10', 'Customer was satisfied with delivery. Requested faster delivery for next order.'),
('C002', 'Jane Smith', 'jane.smith@email.com', '+1 (555) 234-5678', '456 Oak Ave, North Zone, City 12345', 'active', 78, 4567.25, '2024-01-14', 4.9, 'Afternoon (1-5 PM)', '2023-03-22', 'Regular customer, always tips well', 33.3252, 44.3761, 'visited', '2024-01-12', 'Excellent customer service experience. Customer recommended our service to neighbors.'),
('C003', 'Bob Johnson', 'bob.johnson@email.com', '+1 (555) 345-6789', '789 Pine Rd, East District, City 12345', 'inactive', 12, 890.75, '2023-11-20', 4.2, 'Evening (5-8 PM)', '2023-08-10', 'Moved to new address', 33.3052, 44.3561, 'not_visited', NULL, 'Customer moved to new location. Need to update address and schedule new visit.'),
('C004', 'Alice Brown', 'alice.brown@email.com', '+1 (555) 456-7890', '321 Elm St, West Zone, City 12345', 'vip', 156, 8920.00, '2024-01-16', 5.0, 'Flexible', '2022-12-05', 'VIP customer, priority handling', 33.3352, 44.3861, 'visited', '2024-01-15', 'VIP customer visit completed successfully. Customer expressed high satisfaction with our premium service.');
