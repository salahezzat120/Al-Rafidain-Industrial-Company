-- =====================================================
-- SAFE FIX FOR VISIT MANAGEMENT TABLES
-- This script safely fixes any issues without dropping existing data
-- =====================================================

-- Check if tables exist and fix them if needed
-- This approach is safer for production environments

-- =====================================================
-- CHECK AND FIX INTERNAL_MESSAGES TABLE
-- =====================================================

-- Check if internal_messages table exists and has correct structure
DO $$
BEGIN
    -- Check if table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'internal_messages') THEN
        -- Create the table
        CREATE TABLE internal_messages (
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
        RAISE NOTICE 'Created internal_messages table';
    ELSE
        -- Check if sender_id column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'internal_messages' AND column_name = 'sender_id') THEN
            ALTER TABLE internal_messages ADD COLUMN sender_id TEXT;
            RAISE NOTICE 'Added sender_id column to internal_messages table';
        END IF;
        
        -- Check if sender_name column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'internal_messages' AND column_name = 'sender_name') THEN
            ALTER TABLE internal_messages ADD COLUMN sender_name TEXT;
            RAISE NOTICE 'Added sender_name column to internal_messages table';
        END IF;
        
        -- Check if sender_role column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'internal_messages' AND column_name = 'sender_role') THEN
            ALTER TABLE internal_messages ADD COLUMN sender_role TEXT;
            RAISE NOTICE 'Added sender_role column to internal_messages table';
        END IF;
        
        -- Check if recipient_id column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'internal_messages' AND column_name = 'recipient_id') THEN
            ALTER TABLE internal_messages ADD COLUMN recipient_id TEXT;
            RAISE NOTICE 'Added recipient_id column to internal_messages table';
        END IF;
        
        -- Check if recipient_name column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'internal_messages' AND column_name = 'recipient_name') THEN
            ALTER TABLE internal_messages ADD COLUMN recipient_name TEXT;
            RAISE NOTICE 'Added recipient_name column to internal_messages table';
        END IF;
        
        -- Check if recipient_role column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'internal_messages' AND column_name = 'recipient_role') THEN
            ALTER TABLE internal_messages ADD COLUMN recipient_role TEXT;
            RAISE NOTICE 'Added recipient_role column to internal_messages table';
        END IF;
        
        -- Check if subject column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'internal_messages' AND column_name = 'subject') THEN
            ALTER TABLE internal_messages ADD COLUMN subject TEXT;
            RAISE NOTICE 'Added subject column to internal_messages table';
        END IF;
        
        -- Check if message column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'internal_messages' AND column_name = 'message') THEN
            ALTER TABLE internal_messages ADD COLUMN message TEXT;
            RAISE NOTICE 'Added message column to internal_messages table';
        END IF;
        
        -- Check if message_type column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'internal_messages' AND column_name = 'message_type') THEN
            ALTER TABLE internal_messages ADD COLUMN message_type TEXT DEFAULT 'text';
            RAISE NOTICE 'Added message_type column to internal_messages table';
        END IF;
        
        -- Check if is_read column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'internal_messages' AND column_name = 'is_read') THEN
            ALTER TABLE internal_messages ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
            RAISE NOTICE 'Added is_read column to internal_messages table';
        END IF;
        
        -- Check if read_at column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'internal_messages' AND column_name = 'read_at') THEN
            ALTER TABLE internal_messages ADD COLUMN read_at TIMESTAMP WITH TIME ZONE;
            RAISE NOTICE 'Added read_at column to internal_messages table';
        END IF;
        
        -- Check if priority column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'internal_messages' AND column_name = 'priority') THEN
            ALTER TABLE internal_messages ADD COLUMN priority TEXT DEFAULT 'medium';
            RAISE NOTICE 'Added priority column to internal_messages table';
        END IF;
        
        -- Check if created_at column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'internal_messages' AND column_name = 'created_at') THEN
            ALTER TABLE internal_messages ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            RAISE NOTICE 'Added created_at column to internal_messages table';
        END IF;
    END IF;
END $$;

-- =====================================================
-- CHECK AND FIX CHAT_MESSAGES TABLE
-- =====================================================

DO $$
BEGIN
    -- Check if table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_messages') THEN
        -- Create the table
        CREATE TABLE chat_messages (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            sender_id TEXT NOT NULL,
            sender_name TEXT NOT NULL,
            sender_role TEXT NOT NULL,
            message TEXT NOT NULL,
            message_type TEXT NOT NULL CHECK (message_type IN ('user', 'bot')),
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            is_read BOOLEAN DEFAULT FALSE
        );
        RAISE NOTICE 'Created chat_messages table';
    ELSE
        -- Check if sender_id column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'sender_id') THEN
            ALTER TABLE chat_messages ADD COLUMN sender_id TEXT;
            RAISE NOTICE 'Added sender_id column to chat_messages table';
        END IF;
        
        -- Check if sender_name column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'sender_name') THEN
            ALTER TABLE chat_messages ADD COLUMN sender_name TEXT;
            RAISE NOTICE 'Added sender_name column to chat_messages table';
        END IF;
        
        -- Check if sender_role column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'sender_role') THEN
            ALTER TABLE chat_messages ADD COLUMN sender_role TEXT;
            RAISE NOTICE 'Added sender_role column to chat_messages table';
        END IF;
        
        -- Check if message column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'message') THEN
            ALTER TABLE chat_messages ADD COLUMN message TEXT;
            RAISE NOTICE 'Added message column to chat_messages table';
        END IF;
        
        -- Check if message_type column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'message_type') THEN
            ALTER TABLE chat_messages ADD COLUMN message_type TEXT;
            RAISE NOTICE 'Added message_type column to chat_messages table';
        END IF;
        
        -- Check if timestamp column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'timestamp') THEN
            ALTER TABLE chat_messages ADD COLUMN timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            RAISE NOTICE 'Added timestamp column to chat_messages table';
        END IF;
        
        -- Check if is_read column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'is_read') THEN
            ALTER TABLE chat_messages ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
            RAISE NOTICE 'Added is_read column to chat_messages table';
        END IF;
    END IF;
END $$;

-- =====================================================
-- CHECK AND FIX OTHER TABLES
-- =====================================================

-- Check and create visits table if it doesn't exist
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

-- Check and create delegates table if it doesn't exist
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

-- Check and create representatives table if it doesn't exist
CREATE TABLE IF NOT EXISTS representatives (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- Check and create visit_alerts table if it doesn't exist
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

-- =====================================================
-- CREATE INDEXES
-- =====================================================

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_visits_delegate_id ON visits(delegate_id);
CREATE INDEX IF NOT EXISTS idx_visits_customer_id ON visits(customer_id);
CREATE INDEX IF NOT EXISTS idx_visits_status ON visits(status);
CREATE INDEX IF NOT EXISTS idx_visits_scheduled_start_time ON visits(scheduled_start_time);
CREATE INDEX IF NOT EXISTS idx_visits_created_at ON visits(created_at);

CREATE INDEX IF NOT EXISTS idx_delegates_email ON delegates(email);
CREATE INDEX IF NOT EXISTS idx_delegates_status ON delegates(status);
CREATE INDEX IF NOT EXISTS idx_delegates_role ON delegates(role);

CREATE INDEX IF NOT EXISTS idx_representatives_email ON representatives(email);
CREATE INDEX IF NOT EXISTS idx_representatives_status ON representatives(status);

CREATE INDEX IF NOT EXISTS idx_visit_alerts_visit_id ON visit_alerts(visit_id);
CREATE INDEX IF NOT EXISTS idx_visit_alerts_delegate_id ON visit_alerts(delegate_id);
CREATE INDEX IF NOT EXISTS idx_visit_alerts_is_read ON visit_alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_visit_alerts_created_at ON visit_alerts(created_at);

CREATE INDEX IF NOT EXISTS idx_internal_messages_sender_id ON internal_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_internal_messages_recipient_id ON internal_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_internal_messages_is_read ON internal_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_internal_messages_created_at ON internal_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE delegates ENABLE ROW LEVEL SECURITY;
ALTER TABLE representatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DO $$
BEGIN
    -- Visits table policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'visits' AND policyname = 'Allow all operations for authenticated users') THEN
        CREATE POLICY "Allow all operations for authenticated users" ON visits FOR ALL USING (auth.role() = 'authenticated');
    END IF;
    
    -- Delegates table policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'delegates' AND policyname = 'Allow all operations for authenticated users') THEN
        CREATE POLICY "Allow all operations for authenticated users" ON delegates FOR ALL USING (auth.role() = 'authenticated');
    END IF;
    
    -- Representatives table policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'representatives' AND policyname = 'Allow all operations for authenticated users') THEN
        CREATE POLICY "Allow all operations for authenticated users" ON representatives FOR ALL USING (auth.role() = 'authenticated');
    END IF;
    
    -- Visit alerts table policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'visit_alerts' AND policyname = 'Allow all operations for authenticated users') THEN
        CREATE POLICY "Allow all operations for authenticated users" ON visit_alerts FOR ALL USING (auth.role() = 'authenticated');
    END IF;
    
    -- Internal messages table policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'internal_messages' AND policyname = 'Allow all operations for authenticated users') THEN
        CREATE POLICY "Allow all operations for authenticated users" ON internal_messages FOR ALL USING (auth.role() = 'authenticated');
    END IF;
    
    -- Chat messages table policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chat_messages' AND policyname = 'Allow all operations for authenticated users') THEN
        CREATE POLICY "Allow all operations for authenticated users" ON chat_messages FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Visit Management System tables safely fixed!';
    RAISE NOTICE 'All required columns including sender_id have been added';
    RAISE NOTICE 'Indexes, RLS policies have been set up';
    RAISE NOTICE 'No existing data was lost';
END $$;
