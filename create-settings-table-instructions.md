# System Settings Database Setup

## 🚨 **IMPORTANT: Database Table Setup Required**

The system settings feature requires a database table to store settings persistently. Currently, the system is working with localStorage only as a fallback.

## 📋 **Step 1: Create the Database Table**

Go to your **Supabase Dashboard** → **SQL Editor** and run this SQL:

```sql
-- Create the system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  system_settings JSONB NOT NULL DEFAULT '{}',
  security_settings JSONB NOT NULL DEFAULT '{}',
  integration_settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO system_settings (id, system_settings, security_settings, integration_settings)
VALUES (
  1,
  '{
    "companyName": "Al-Rafidain Industrial Company",
    "companyEmail": "admin@alrafidain.com",
    "companyPhone": "+966 11 123 4567",
    "companyAddress": "King Fahd Road, Riyadh 12345, Saudi Arabia",
    "timezone": "Asia/Riyadh",
    "currency": "SAR",
    "language": "ar",
    "autoAssignTasks": true,
    "realTimeTracking": true,
    "emailNotifications": true,
    "smsNotifications": true,
    "pushNotifications": true,
    "dataRetention": "12",
    "backupFrequency": "daily",
    "workingHours": {"start": "08:00", "end": "17:00"},
    "customerTypes": ["active", "vip", "inactive"],
    "coverageZones": ["Riyadh", "Jeddah", "Dammam", "Mecca", "Medina"],
    "selectedCustomerType": "active",
    "selectedCoverageZone": "Riyadh"
  }',
  '{
    "minPasswordLength": 8,
    "passwordExpiry": 90,
    "requireUppercase": true,
    "requireNumbers": true,
    "requireSymbols": false,
    "sessionTimeout": 30,
    "maxLoginAttempts": 5,
    "lockoutEnabled": true,
    "twoFactorEnabled": false,
    "sms2FA": false,
    "email2FA": false
  }',
  '{
    "smtpHost": "smtp.gmail.com",
    "smtpPort": 587,
    "smtpUser": "",
    "smtpPass": "",
    "emailEnabled": false,
    "smsProvider": "twilio",
    "smsApiKey": "",
    "smsEnabled": false,
    "supabaseEnabled": true,
    "backupEnabled": true,
    "apiRateLimit": 1000,
    "apiTimeout": 30,
    "apiEnabled": true
  }'
)
ON CONFLICT (id) DO NOTHING;

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_system_settings_updated_at();
```

## ✅ **Step 2: Verify the Setup**

After running the SQL:

1. **Refresh your application**
2. **Go to System Settings** in the admin panel
3. **Make a change** to any setting
4. **Click Save** - you should see "Settings saved successfully and applied system-wide!"
5. **Refresh the page** - your changes should persist

## 🔧 **Current Status**

- ✅ **Settings Context**: Implemented and working
- ✅ **localStorage Fallback**: Working (settings persist in browser)
- ⏳ **Database Persistence**: Requires table creation (see Step 1)
- ✅ **System-wide Broadcasting**: Working
- ✅ **Error Handling**: Graceful fallback to localStorage

## 📊 **What Works Now**

Even without the database table, the system settings are working with localStorage:

- ✅ Settings are saved and persist across page refreshes
- ✅ Changes are broadcast to all components
- ✅ All UI functionality works perfectly
- ✅ Error handling prevents crashes

## 🚀 **After Database Setup**

Once you create the database table:

- ✅ Settings will be stored in the database
- ✅ Settings will sync across different browsers/devices
- ✅ Settings will be backed up with your database
- ✅ Multiple users can share the same settings

## 🆘 **Need Help?**

If you encounter any issues:

1. **Check the browser console** for any error messages
2. **Verify the table was created** in Supabase Dashboard → Table Editor
3. **Check the SQL Editor** for any syntax errors
4. **Refresh the application** after creating the table

The system is designed to work gracefully with or without the database table!
