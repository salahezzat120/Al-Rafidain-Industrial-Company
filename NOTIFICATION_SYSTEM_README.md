# Notification and Alert System

## Overview

This document describes the comprehensive notification and alert system implemented for the Al-Rafidain Industrial Company delivery management system. The system includes visit management, delegate tracking, internal messaging, and an AI-powered chatbot.

## Features Implemented

### 1. Visit Management System
- **Location**: `components/admin/visits-tab.tsx`
- **Purpose**: Manage delegate visits to customers
- **Features**:
  - Schedule new visits with delegate assignment
  - Track visit status (scheduled, in progress, completed, late, cancelled)
  - Monitor visit duration and time limits
  - View visit details and history
  - Filter visits by status and search functionality

### 2. Late Visit Alert System
- **Location**: `lib/visits.ts` - `checkLateVisits()` function
- **Purpose**: Automatically detect and alert when delegates are late to visits
- **Features**:
  - Real-time monitoring of scheduled visits
  - Automatic alert generation for late arrivals
  - Admin notification system
  - Alert severity levels (low, medium, high, critical)

### 3. Visit Time Limit Monitoring
- **Location**: `lib/visits.ts` - `checkExceededTimeVisits()` function
- **Purpose**: Monitor and alert when delegates exceed allowed visit time
- **Features**:
  - Configurable time limits per visit
  - Automatic detection of exceeded time
  - Real-time notifications to admins
  - Time tracking and reporting

### 4. Internal Messaging System
- **Location**: `components/admin/messaging-tab.tsx`
- **Purpose**: Enable communication between admin and staff
- **Features**:
  - Send messages between users
  - Message priority levels (low, medium, high, urgent)
  - Message types (text, system alert, visit update, urgent)
  - Read/unread status tracking
  - Message search and filtering

### 5. AI-Powered Chatbot
- **Location**: `components/chatbot/chatbot.tsx`
- **Purpose**: Provide intelligent assistance for common queries
- **Features**:
  - Natural language processing for user queries
  - Context-aware responses about visits, delegates, and system status
  - Quick action buttons for common tasks
  - Minimizable/maximizable interface
  - Real-time chat experience

### 6. Enhanced Alerts Tab
- **Location**: `components/admin/alerts-tab.tsx` (updated)
- **Purpose**: Centralized alert management
- **Features**:
  - Integration with visit alerts
  - Separate tab for visit-specific alerts
  - Alert severity indicators
  - Mark as read functionality
  - Notification settings for different alert types

## Database Schema

The system uses the following new database tables:

### Tables Created
1. **visits** - Stores visit information and scheduling
2. **delegates** - Stores delegate/staff information
3. **visit_alerts** - Stores alerts related to visits
4. **internal_messages** - Stores internal communication
5. **chat_messages** - Stores chatbot conversation history

### Key Features
- Row Level Security (RLS) enabled
- Automatic timestamp updates
- Proper indexing for performance
- Foreign key relationships
- Data validation constraints

## API Functions

### Visit Management
- `createVisit()` - Create a new visit
- `updateVisit()` - Update visit information
- `getVisitsByDelegate()` - Get visits for a specific delegate
- `getUpcomingVisits()` - Get all upcoming visits

### Alert Management
- `createVisitAlert()` - Create a new visit alert
- `getUnreadAlerts()` - Get all unread alerts
- `markAlertAsRead()` - Mark an alert as read
- `checkLateVisits()` - Check for late visits
- `checkExceededTimeVisits()` - Check for exceeded time visits

### Messaging
- `sendInternalMessage()` - Send internal message
- `getMessagesForUser()` - Get messages for a user
- `markMessageAsRead()` - Mark message as read
- `sendChatMessage()` - Send chatbot message
- `getChatMessages()` - Get chat history

## Monitoring and Automation

### Real-time Monitoring
- **Interval**: Every 60 seconds
- **Functions**: 
  - `checkLateVisits()` - Monitors for late arrivals
  - `checkExceededTimeVisits()` - Monitors for time limit violations
- **Actions**: Automatic alert creation and admin notification

### Alert Types
1. **Late Arrival** - When delegate is late to scheduled visit
2. **Time Exceeded** - When delegate exceeds allowed visit time
3. **No Show** - When delegate doesn't arrive (future feature)
4. **Early Completion** - When visit completes early (future feature)

## User Interface

### New Tabs Added
1. **Visit Management** - Complete visit scheduling and tracking
2. **Internal Messaging** - Staff communication system
3. **Enhanced Alerts** - Integrated alert management

### Chatbot Integration
- Floating chatbot widget
- Minimizable interface
- Quick action buttons
- Context-aware responses

## Configuration

### Alert Settings
Users can configure notification preferences for:
- Late visit alerts
- Time exceeded alerts
- Internal message notifications
- System alerts
- Vehicle maintenance alerts
- Route optimization alerts

### Visit Settings
- Configurable time limits per visit type
- Priority levels (low, medium, high, urgent)
- Visit types (delivery, pickup, inspection, maintenance, meeting)

## Security

### Row Level Security (RLS)
- All tables have RLS enabled
- Policies allow operations for authenticated users
- Can be customized for role-based access

### Data Validation
- Input validation on all forms
- Database constraints for data integrity
- Type checking for all API functions

## Future Enhancements

### Planned Features
1. **Push Notifications** - Real-time browser notifications
2. **Email Integration** - Email alerts for critical issues
3. **SMS Notifications** - SMS alerts for urgent matters
4. **Advanced Analytics** - Visit performance metrics
5. **Mobile App Integration** - Mobile notifications
6. **Voice Commands** - Voice interaction with chatbot

### Scalability Considerations
- Database indexing for performance
- Efficient query patterns
- Caching strategies for frequently accessed data
- Real-time updates using WebSockets (future)

## Usage Instructions

### For Administrators
1. Navigate to "Visit Management" tab to schedule visits
2. Use "Internal Messaging" tab to communicate with staff
3. Monitor "Alerts" tab for system notifications
4. Use the chatbot for quick information queries

### For Staff/Delegates
1. Receive notifications about assigned visits
2. Update visit status in real-time
3. Communicate with admin through messaging system
4. Use chatbot for assistance

## Technical Requirements

### Dependencies
- Next.js 15.2.4
- React 19
- Supabase for backend
- Tailwind CSS for styling
- Lucide React for icons

### Browser Support
- Modern browsers with ES6+ support
- WebSocket support for real-time features
- Local storage for user preferences

## Troubleshooting

### Common Issues
1. **Alerts not showing**: Check notification settings
2. **Chatbot not responding**: Verify network connection
3. **Visit updates not saving**: Check form validation
4. **Messages not sending**: Verify recipient selection

### Debug Information
- All API calls include error logging
- Console logs available for debugging
- Database queries are logged for monitoring

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.
