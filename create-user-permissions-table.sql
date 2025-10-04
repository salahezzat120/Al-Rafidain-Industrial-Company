-- Create user_permissions table to store user page access permissions
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_permissions_updated_at
  BEFORE UPDATE ON user_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_permissions_updated_at();

-- Enable RLS (Row Level Security)
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for user_permissions
-- Users can only access their own permissions, admins can access all
CREATE POLICY "Users can view their own permissions" ON user_permissions
  FOR SELECT USING (
    auth.uid()::text = user_id::text OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all permissions" ON user_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- Insert sample permissions for existing users (optional)
-- This will give all existing users view access to overview page
INSERT INTO user_permissions (user_id, permissions)
SELECT 
  id,
  '[{"pageId": "overview", "pageName": "Overview", "permission": "view"}]'::jsonb
FROM users
WHERE NOT EXISTS (
  SELECT 1 FROM user_permissions WHERE user_permissions.user_id = users.id
);

-- Add comment to table
COMMENT ON TABLE user_permissions IS 'Stores user page access permissions for the admin panel';
COMMENT ON COLUMN user_permissions.permissions IS 'JSON array of page permissions with pageId, pageName, and permission level';
