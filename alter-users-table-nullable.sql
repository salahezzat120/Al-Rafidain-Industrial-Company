-- Alternative: Modify existing users table to allow NULL password_hash
-- This preserves existing data

-- First, update any existing representatives to have NULL password_hash
UPDATE users 
SET password_hash = NULL 
WHERE role = 'representative';

-- Then alter the column to allow NULL values
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Insert representatives from representatives table (if not already there)
INSERT INTO users (id, email, password_hash, role, name)
SELECT 
    r.id,
    r.email,
    NULL, -- No password for representatives (they use ID for authentication)
    'representative',
    r.name
FROM representatives r
WHERE NOT EXISTS (
    SELECT 1 FROM users u WHERE u.email = r.email
);
