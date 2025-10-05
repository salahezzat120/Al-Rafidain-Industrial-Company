# Alerts Database Setup Guide

## 🎯 **Quick Setup**

The Alerts & Notifications tab now reads from a unified database table. Here's how to set it up:

### **Step 1: Create the Database Table**

Run the SQL script to create the unified alerts table:

```sql
-- Run this in your Supabase SQL editor
-- File: create-unified-alerts-notifications-table.sql
```

### **Step 2: Verify Setup**

The component will automatically:
- ✅ Check if the database table exists
- ✅ Create sample data if no alerts exist
- ✅ Fall back to mock data if database is unavailable
- ✅ Show console logs for debugging

### **Step 3: Test the System**

1. Open the **Alerts & Notifications** tab
2. Check the browser console for setup logs
3. You should see sample alerts if database is working
4. Try creating a test alert using the "Test Alert" button

## 🔧 **Database Features**

### **Unified Table Structure**
- **All alert types** in one table
- **Real-time statistics** with database functions
- **Proper indexing** for fast queries
- **Automatic fallbacks** if database fails

### **Sample Data Included**
- System test alerts
- Late visit alerts with escalation
- Vehicle low fuel alerts
- Visit management alerts

### **Automatic Initialization**
The component will automatically:
1. Check database connection
2. Verify table exists
3. Create sample data if needed
4. Load alerts from database
5. Fall back to mock data if database fails

## 🐛 **Troubleshooting**

### **If No Alerts Appear**
1. Check browser console for error messages
2. Verify Supabase connection in environment variables
3. Run the SQL script to create the table
4. Check if sample data was created

### **Console Logs to Look For**
```
✅ Database connection successful
✅ Alerts database table exists and is accessible
✅ Sample alerts created successfully
Loading system alerts from database...
Database alerts loaded: X
```

### **Common Issues**
- **Table doesn't exist**: Run the SQL script
- **Connection failed**: Check Supabase credentials
- **No data**: Sample data will be created automatically
- **Fallback mode**: Component will use mock data

## 📊 **Database Schema**

The unified table includes:
- Alert classification (type, category, severity)
- Visit information (delegate, customer, timing)
- Notification settings (push, email, SMS)
- Escalation tracking (levels, timestamps)
- Metadata storage (JSONB for flexibility)

## 🚀 **Next Steps**

Once the database is set up:
1. The tab will read real alerts from the database
2. Test alerts can be created and resolved
3. Late visit monitoring will work with real data
4. All statistics will be calculated from database

The system is designed to be robust with automatic fallbacks, so it will work even if the database isn't set up yet!
