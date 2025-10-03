-- Create representatives table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.representatives (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  status text NOT NULL DEFAULT 'available'::text,
  location text NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT representatives_pkey PRIMARY KEY (id),
  CONSTRAINT representatives_email_key UNIQUE (email),
  CONSTRAINT representatives_status_check CHECK (
    status = ANY (
      ARRAY['available'::text, 'busy'::text, 'offline'::text]
    )
  )
) TABLESPACE pg_default;

-- Add sample representatives
INSERT INTO representatives (
  name,
  email,
  phone,
  status,
  location,
  is_active
) VALUES 
(
  'Ahmed Hassan',
  'ahmed.hassan@company.com',
  '+964-750-123-4567',
  'available',
  'Baghdad Central',
  true
),
(
  'Sarah Johnson',
  'sarah.johnson@company.com',
  '+964-750-234-5678',
  'available',
  'Basra Warehouse',
  true
),
(
  'Mohammed Ali',
  'mohammed.ali@company.com',
  '+964-750-345-6789',
  'busy',
  'Erbil Distribution',
  true
),
(
  'Fatima Al-Zahra',
  'fatima.alzahra@company.com',
  '+964-750-456-7890',
  'available',
  'Mosul Branch',
  true
),
(
  'Omar Khalil',
  'omar.khalil@company.com',
  '+964-750-567-8901',
  'available',
  'Najaf Office',
  true
),
(
  'Layla Ahmed',
  'layla.ahmed@company.com',
  '+964-750-678-9012',
  'offline',
  'Karbala Center',
  true
),
(
  'Hassan Al-Mahmoud',
  'hassan.mahmoud@company.com',
  '+964-750-789-0123',
  'available',
  'Fallujah Depot',
  true
),
(
  'Nour Al-Din',
  'nour.aldin@company.com',
  '+964-750-890-1234',
  'available',
  'Ramadi Facility',
  true
);

-- Verify the data was inserted
SELECT 
  COUNT(*) as total_representatives,
  COUNT(CASE WHEN status = 'available' THEN 1 END) as available_representatives,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_representatives
FROM representatives;

-- Show sample of inserted representatives
SELECT 
  id,
  name,
  email,
  phone,
  status,
  location,
  is_active
FROM representatives 
WHERE is_active = true 
ORDER BY name
LIMIT 5;


