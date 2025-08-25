-- Al-Rafidain Industrial Company
-- Customers Table Schema with GPS and Visit Tracking
-- Execute this in your Supabase SQL editor

-- Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    status TEXT NOT NULL DEFAULT 'active',
    visit_status TEXT NOT NULL DEFAULT 'not_visited',
    total_orders INTEGER NOT NULL DEFAULT 0,
    total_spent DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    last_order_date DATE NULL,
    rating DECIMAL(2, 1) NOT NULL DEFAULT 0.0,
    preferred_delivery_time TEXT NULL,
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT NULL,
    visit_notes TEXT NULL,
    last_visit_date DATE NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Primary key
    CONSTRAINT customers_pkey PRIMARY KEY (id),
    
    -- Unique constraints
    CONSTRAINT customers_email_key UNIQUE (email),
    
    -- Check constraints
    CONSTRAINT customers_status_check CHECK (
        status = ANY (ARRAY['active'::text, 'inactive'::text, 'vip'::text])
    ),
    CONSTRAINT customers_visit_status_check CHECK (
        visit_status = ANY (ARRAY['visited'::text, 'not_visited'::text, 'scheduled'::text])
    ),
    CONSTRAINT customers_rating_check CHECK (
        rating >= 0.0 AND rating <= 5.0
    ),
    CONSTRAINT customers_latitude_check CHECK (
        latitude IS NULL OR (latitude >= -90 AND latitude <= 90)
    ),
    CONSTRAINT customers_longitude_check CHECK (
        longitude IS NULL OR (longitude >= -180 AND longitude <= 180)
    )
) TABLESPACE pg_default;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers USING btree (email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers USING btree (status);
CREATE INDEX IF NOT EXISTS idx_customers_visit_status ON public.customers USING btree (visit_status);
CREATE INDEX IF NOT EXISTS idx_customers_location ON public.customers USING btree (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON public.customers USING btree (created_at);
CREATE INDEX IF NOT EXISTS idx_customers_last_visit_date ON public.customers USING btree (last_visit_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to view and modify customers
CREATE POLICY "Enable all operations for authenticated users" ON public.customers
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert sample data for testing
INSERT INTO public.customers (
    name, email, phone, address, latitude, longitude, 
    status, visit_status, total_orders, total_spent, 
    rating, preferred_delivery_time, notes, visit_notes
) VALUES 
(
    'Ahmed Hassan',
    'ahmed.hassan@email.com',
    '+20 100 123 4567',
    '123 Tahrir Square, Downtown Cairo, Egypt',
    30.0444,
    31.2357,
    'active',
    'visited',
    25,
    1250.75,
    4.5,
    'Morning (9-12 PM)',
    'Regular customer, prefers contactless delivery',
    'Last visit went well, customer satisfied with service'
),
(
    'Fatima Al-Zahra',
    'fatima.alzahra@email.com',
    '+20 101 234 5678',
    '456 Zamalek District, Zamalek, Cairo, Egypt',
    30.0626,
    31.2197,
    'vip',
    'scheduled',
    67,
    3340.25,
    4.9,
    'Afternoon (1-5 PM)',
    'VIP customer, always tips well, priority handling required',
    'Visit scheduled for next Tuesday'
),
(
    'Omar Mahmoud',
    'omar.mahmoud@email.com',
    '+20 102 345 6789',
    '789 New Cairo, Fifth Settlement, Cairo, Egypt',
    30.0330,
    31.4913,
    'active',
    'not_visited',
    8,
    420.50,
    4.2,
    'Evening (5-8 PM)',
    'New customer, lives in gated community',
    ''
),
(
    'Nour El-Din',
    'nour.eldin@email.com',
    '+20 103 456 7890',
    '321 Maadi District, Maadi, Cairo, Egypt',
    29.9602,
    31.2569,
    'inactive',
    'visited',
    45,
    2180.00,
    4.7,
    'Flexible',
    'Moved to new address, need to update location',
    'Last visit confirmed address change'
),
(
    'Yasmin Farouk',
    'yasmin.farouk@email.com',
    '+20 104 567 8901',
    '654 Heliopolis, Heliopolis, Cairo, Egypt',
    30.0808,
    31.3238,
    'vip',
    'visited',
    89,
    4567.80,
    5.0,
    'Morning (9-12 PM)',
    'Long-term VIP customer, excellent relationship',
    'Always provides excellent feedback, very satisfied'
),
(
    'Karim Abdel Rahman',
    'karim.abdel@email.com',
    '+20 105 678 9012',
    '987 Giza District, Giza, Egypt',
    30.0131,
    31.2089,
    'active',
    'not_visited',
    12,
    680.25,
    4.3,
    'Afternoon (1-5 PM)',
    'Works from home, flexible with delivery times',
    ''
);

-- Grant necessary permissions
GRANT ALL ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;

-- Create view for customer statistics
CREATE OR REPLACE VIEW public.customer_stats AS
SELECT 
    COUNT(*) as total_customers,
    COUNT(*) FILTER (WHERE status = 'active') as active_customers,
    COUNT(*) FILTER (WHERE status = 'vip') as vip_customers,
    COUNT(*) FILTER (WHERE status = 'inactive') as inactive_customers,
    COUNT(*) FILTER (WHERE visit_status = 'visited') as visited_customers,
    COUNT(*) FILTER (WHERE visit_status = 'not_visited') as not_visited_customers,
    COUNT(*) FILTER (WHERE visit_status = 'scheduled') as scheduled_customers,
    ROUND(SUM(total_spent), 2) as total_revenue,
    ROUND(AVG(rating), 2) as average_rating,
    COUNT(*) FILTER (WHERE latitude IS NOT NULL AND longitude IS NOT NULL) as customers_with_gps
FROM public.customers;

-- Grant permissions on the view
GRANT SELECT ON public.customer_stats TO authenticated;
GRANT SELECT ON public.customer_stats TO service_role;

-- Create function to update visit status
CREATE OR REPLACE FUNCTION update_customer_visit_status(
    customer_id UUID,
    new_visit_status TEXT,
    visit_note TEXT DEFAULT ''
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.customers 
    SET 
        visit_status = new_visit_status,
        visit_notes = CASE 
            WHEN visit_note != '' THEN visit_note
            ELSE visit_notes
        END,
        last_visit_date = CASE 
            WHEN new_visit_status = 'visited' THEN CURRENT_DATE
            ELSE last_visit_date
        END,
        updated_at = NOW()
    WHERE id = customer_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get customers near a location (within radius in km)
CREATE OR REPLACE FUNCTION get_customers_near_location(
    target_lat DECIMAL,
    target_lng DECIMAL,
    radius_km INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    distance_km DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.email,
        c.phone,
        c.address,
        c.latitude,
        c.longitude,
        ROUND(
            (6371 * acos(
                cos(radians(target_lat)) * 
                cos(radians(c.latitude)) * 
                cos(radians(c.longitude) - radians(target_lng)) + 
                sin(radians(target_lat)) * 
                sin(radians(c.latitude))
            ))::DECIMAL, 2
        ) as distance_km
    FROM public.customers c
    WHERE 
        c.latitude IS NOT NULL 
        AND c.longitude IS NOT NULL
        AND (
            6371 * acos(
                cos(radians(target_lat)) * 
                cos(radians(c.latitude)) * 
                cos(radians(c.longitude) - radians(target_lng)) + 
                sin(radians(target_lat)) * 
                sin(radians(c.latitude))
            )
        ) <= radius_km
    ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;

-- Create function to get customer visit history
CREATE OR REPLACE FUNCTION get_customer_visit_history(customer_id UUID)
RETURNS TABLE (
    visit_date DATE,
    visit_status TEXT,
    visit_notes TEXT
) AS $$
BEGIN
    -- This is a simplified version. In a real system, you'd have a separate visits table
    RETURN QUERY
    SELECT 
        c.last_visit_date,
        c.visit_status,
        c.visit_notes
    FROM public.customers c
    WHERE c.id = customer_id AND c.last_visit_date IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE public.customers IS 'Customer information with GPS coordinates and visit tracking';
COMMENT ON COLUMN public.customers.latitude IS 'GPS latitude coordinate (decimal degrees)';
COMMENT ON COLUMN public.customers.longitude IS 'GPS longitude coordinate (decimal degrees)';
COMMENT ON COLUMN public.customers.visit_status IS 'Current visit status: visited, not_visited, scheduled';
COMMENT ON COLUMN public.customers.visit_notes IS 'Notes about customer visits and interactions';
COMMENT ON COLUMN public.customers.last_visit_date IS 'Date of the last visit to this customer';
COMMENT ON FUNCTION update_customer_visit_status IS 'Updates customer visit status and related fields';
COMMENT ON FUNCTION get_customers_near_location IS 'Returns customers within specified radius from a GPS location';

-- Show completion message
SELECT 'Customers table with GPS and visit tracking features created successfully!' as message;
