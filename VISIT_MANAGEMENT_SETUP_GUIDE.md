# Visit Management System Setup Guide

## Overview
The Visit Management System is a comprehensive solution for managing delegate visits, tracking schedules, and monitoring visit statuses. This guide will help you set up and configure the system properly.

## Database Setup

### 1. Run the Database Setup Script
Execute the `create-visit-management-tables.sql` script in your Supabase SQL Editor:

```sql
-- The script creates the following tables:
-- - visits: Main table for visit scheduling and tracking
-- - delegates: Staff members who can perform visits
-- - representatives: Extended delegate information
-- - visit_alerts: Alerts for late visits, exceeded time, etc.
-- - internal_messages: Communication between staff
-- - chat_messages: Chatbot conversation history
```

### 2. Verify Database Tables
Run the test script to verify all tables are working:

```bash
node test-visit-management-system.js
```

## System Components

### 1. Visit Management Tab (`components/admin/visits-tab.tsx`)
- **Purpose**: Main interface for managing visits
- **Features**:
  - Schedule new visits
  - View visit status and details
  - Filter visits by delegate, customer, date
  - Real-time alerts for late visits
  - Visit status updates

### 2. Database Tables

#### Visits Table
```sql
CREATE TABLE visits (
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
    status TEXT NOT NULL DEFAULT 'scheduled',
    visit_type TEXT NOT NULL DEFAULT 'delivery',
    priority TEXT NOT NULL DEFAULT 'medium',
    notes TEXT,
    allowed_duration_minutes INTEGER NOT NULL DEFAULT 60,
    is_late BOOLEAN DEFAULT FALSE,
    exceeds_time_limit BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Delegates Table
```sql
CREATE TABLE delegates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'available',
    current_location TEXT,
    avatar_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. API Functions (`lib/visits.ts`)

#### Visit Management Functions
- `createVisit()` - Create a new visit
- `updateVisit()` - Update visit information
- `getVisitsByDelegate()` - Get visits for a specific delegate
- `getUpcomingVisits()` - Get all upcoming visits

#### Alert Management Functions
- `createVisitAlert()` - Create a new visit alert
- `getUnreadAlerts()` - Get all unread alerts
- `markAlertAsRead()` - Mark an alert as read
- `checkLateVisits()` - Check for late visits
- `checkExceededTimeVisits()` - Check for exceeded time visits

#### Messaging Functions
- `sendInternalMessage()` - Send internal message
- `getMessagesForUser()` - Get messages for a user
- `markMessageAsRead()` - Mark message as read
- `sendChatMessage()` - Send chatbot message
- `getChatMessages()` - Get chat history

## Navigation and Tab Integration

### 1. Admin Sidebar Integration
The Visit Management tab is integrated into the admin sidebar:

```typescript
const sidebarItems = [
  // ... other items
  { id: "visits", label: t("nav.visitManagement"), icon: Calendar },
  // ... other items
]
```

### 2. Main Dashboard Integration
The visits tab is rendered in the main dashboard:

```typescript
{activeTab === "visits" && <VisitsTab />}
```

### 3. All Available Tabs
The system includes the following tabs:
- Overview
- User Management
- Employee Management
- Representative Management
- Customer Management
- Warehouse Management
- Payment Tracking
- Attendance
- Chat Support
- Live Map
- Vehicles
- Delivery Tasks
- Analytics
- Alerts
- **Visit Management** ← New tab
- Internal Messaging
- After Sales Support
- Settings

## Features and Functionality

### 1. Visit Scheduling
- Create new visits with delegate assignment
- Set visit type (delivery, pickup, inspection, maintenance, meeting)
- Set priority levels (low, medium, high, urgent)
- Schedule start and end times
- Add notes and special instructions

### 2. Real-time Monitoring
- Live status updates
- Late visit alerts
- Time exceeded notifications
- Visit completion tracking

### 3. Filtering and Search
- Filter by delegate
- Filter by customer
- Filter by date range
- Filter by visit type
- Filter by status
- Search by customer name or address

### 4. Alert System
- Automatic late visit detection
- Time exceeded warnings
- Real-time notifications
- Alert severity levels

### 5. Reporting
- Visit completion rates
- Delegate performance metrics
- Customer visit history
- Time tracking reports

## Configuration

### 1. Environment Variables
Ensure these environment variables are set:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Language Support
The system supports both English and Arabic with RTL support:

```typescript
const { t, isRTL } = useLanguage()
```

### 3. Responsive Design
The interface is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## Testing

### 1. Manual Testing
1. Navigate to the Visit Management tab
2. Create a new visit
3. Update visit status
4. Test filtering and search
5. Verify alerts are working

### 2. Automated Testing
Run the test script:

```bash
node test-visit-management-system.js
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify Supabase credentials
   - Check network connectivity
   - Ensure tables exist

2. **Missing Data**
   - Run the database setup script
   - Check RLS policies
   - Verify user permissions

3. **UI Issues**
   - Check component imports
   - Verify language context
   - Check responsive design

## Support

For technical support or questions about the Visit Management System:

1. Check the console for error messages
2. Verify database table existence
3. Test API functions individually
4. Check component imports and dependencies

## Conclusion

The Visit Management System is now fully integrated into the Al-Rafidain Industrial Company application. All tabs are working properly, and the system provides comprehensive visit tracking, scheduling, and monitoring capabilities.

The system includes:
- ✅ Database tables created
- ✅ UI components implemented
- ✅ API functions working
- ✅ Navigation integrated
- ✅ All tabs functional
- ✅ Real-time monitoring
- ✅ Alert system
- ✅ Responsive design
- ✅ Multi-language support
