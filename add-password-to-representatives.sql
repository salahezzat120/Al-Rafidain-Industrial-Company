-- Add password field to representatives table
-- Run this script in your Supabase SQL editor

-- Add password column to representatives table
ALTER TABLE representatives ADD COLUMN IF NOT EXISTS password TEXT;

-- Add index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_representatives_email ON representatives(email);

-- Add index for faster ID lookups
CREATE INDEX IF NOT EXISTS idx_representatives_id ON representatives(id);

-- Update existing representatives with default password (they should change it on first login)
UPDATE representatives SET password = 'changeme123' WHERE password IS NULL;

-- Make password required for new records
ALTER TABLE representatives ALTER COLUMN password SET NOT NULL;
