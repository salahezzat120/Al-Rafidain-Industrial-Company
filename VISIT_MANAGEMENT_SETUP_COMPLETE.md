# 🏢 Visit Management System - Complete Setup Guide

## 📋 Overview

This guide ensures the visit management table can properly handle all the fields from the "Add New Visit" form, including auto-filled delegate and customer information.

## 🗄️ Database Setup

### 1. Create the Complete Table

Run the SQL script to create the table with all required fields:

```sql
-- Execute this file
\i create-visit-management-table-complete.sql
```

### 2. Test the Table Structure

Run the test script to verify form data can be inserted:

```sql
-- Execute this file  
\i test-visit-form-data.sql
```

## 📝 Form Field Mapping

The "Add New Visit" form maps to the following database fields:

### **Visit Information**
- `visit_id` → Auto-generated (e.g., "V705613662")
- `delegate_id` → Delegate ID field (e.g., "REP-263338")

### **Delegate Information (Auto-filled)**
- `delegate_name` → "maged" (auto-filled from representatives table)
- `delegate_email` → "salahezzat120@gmail.com" (auto-filled)
- `delegate_phone` → "+201022505987" (auto-filled)
- `delegate_role` → "representative" (dropdown selection)

### **Customer Information**
- `customer_id` → "C001" (from customer dropdown)
- `customer_name` → "salah ezzat" (auto-filled from customers table)
- `customer_address` → "sssssssssss" (auto-filled)
- `customer_phone` → "+20459083040" (auto-filled)
- `customer_email` → "salahezzat120@gmail.com" (auto-filled)

### **Visit Details**
- `visit_type` → "delivery" (dropdown: delivery, pickup, inspection, maintenance, meeting)
- `priority` → "medium" (dropdown: low, medium, high, urgent)
- `allowed_duration_minutes` → 60 (duration field)

### **Time Information**
- `scheduled_start_time` → "2025-10-05 02:37:00+00" (start time picker)
- `scheduled_end_time` → "2025-10-05 03:37:00+00" (end time picker)

### **Additional Fields**
- `notes` → "Additional notes..." (notes textarea)
- `status` → "scheduled" (default status)
- `delegate_status` → "available" (default)
- `transportation_type` → "foot" (default)

## 🔧 API Functions

The existing API functions in `lib/visit-management-single.ts` handle:

- ✅ **createVisit()** - Creates new visits with all form data
- ✅ **updateVisit()** - Updates existing visits
- ✅ **getAllVisits()** - Retrieves all visits
- ✅ **getVisitsByDelegate()** - Gets visits by delegate ID
- ✅ **Empty Error Handling** - Prevents console errors

## 🎯 Form Data Flow

1. **User fills form** → Form data collected
2. **Auto-fill triggers** → Delegate/customer data populated
3. **Form submission** → Data sent to `createVisit()`
4. **Database insert** → Data stored in `visit_management` table
5. **Success response** → Visit created successfully

## 📊 Table Constraints

The table includes comprehensive constraints:

### **Role Constraints**
- `delegate_role`: driver, representative, supervisor, technician, sales_rep
- `delegate_status`: available, busy, offline, on_visit, active, inactive, on-route

### **Visit Constraints**
- `visit_type`: delivery, pickup, inspection, maintenance, meeting
- `priority`: low, medium, high, urgent
- `status`: scheduled, in_progress, completed, cancelled, late

### **Message Constraints**
- `message_type`: text, system_alert, visit_update, urgent
- `message_priority`: low, medium, high, urgent
- `chat_message_type`: user, bot

## 🚀 Testing

### Test Form Data Insertion

```sql
-- This matches the exact form data from the image
INSERT INTO public.visit_management (
  visit_id, delegate_id, delegate_name, delegate_email, delegate_phone, delegate_role,
  customer_id, customer_name, customer_address, customer_phone, customer_email,
  visit_type, priority, allowed_duration_minutes, scheduled_start_time, scheduled_end_time,
  notes
) VALUES (
  'V705613662', 'REP-263338', 'maged', 'salahezzat120@gmail.com', '+201022505987', 'representative',
  'C001', 'salah ezzat', 'sssssssssss', '+20459083040', 'salahezzat120@gmail.com',
  'delivery', 'medium', 60, '2025-10-05 02:37:00+00', '2025-10-05 03:37:00+00',
  'Additional notes...'
);
```

### Verify Data

```sql
SELECT 
  visit_id, delegate_name, customer_name, visit_type, priority, status,
  scheduled_start_time, scheduled_end_time
FROM public.visit_management 
WHERE visit_id = 'V705613662';
```

## ✅ Success Criteria

- ✅ **Table Created** - All fields and constraints in place
- ✅ **Form Data Compatible** - All form fields map to table columns
- ✅ **Auto-fill Working** - Delegate and customer data populates correctly
- ✅ **Constraints Valid** - All dropdown values validated
- ✅ **API Functions Ready** - Create/update/retrieve functions working
- ✅ **Error Handling** - Empty error objects prevented

## 🎉 Result

The visit management system is now fully compatible with the "Add New Visit" form and can handle all the data fields shown in the form interface, including auto-filled delegate and customer information! 🚀
