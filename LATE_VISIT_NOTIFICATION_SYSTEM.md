# Late Visit Notification System

## 🎯 **Overview**

A comprehensive late visit monitoring and notification system that automatically detects when scheduled visits pass their scheduled time without agent arrival confirmation, and immediately creates and sends notifications to administrators with detailed visit information, agent status, and recommended actions.

## ✅ **Implemented Features**

### **1. Late Visit Monitoring (`lib/late-visit-monitor.ts`)**
- **Real-time Monitoring**: Continuous monitoring of scheduled visits
- **Grace Period Logic**: Configurable grace period before considering a visit late
- **Escalation System**: Automatic escalation based on delay duration
- **Status Tracking**: Monitors agent arrival confirmation and location updates
- **Duplicate Prevention**: Prevents duplicate alerts for the same visit

### **2. Notification Generation**
- **Dashboard Notifications**: Real-time alerts in the admin dashboard
- **Push Notifications**: Mobile push notifications with action buttons
- **Email Notifications**: Detailed email alerts with visit information
- **Admin Notifications**: Internal messaging system integration

### **3. Escalation System**
- **Initial Alert**: Warning when grace period is exceeded
- **Escalated Alert**: Critical alert when escalation threshold is reached
- **Supervisor Notification**: Automatic escalation to supervisors
- **Priority Management**: Dynamic priority based on delay duration

### **4. Enhanced Alerts Tab (`components/admin/alerts-tab.tsx`)**
- **Late Visit Monitoring Tab**: Dedicated interface for monitoring configuration
- **Real-time Status**: Live monitoring status and configuration display
- **Configuration Controls**: Adjustable grace periods and escalation thresholds
- **Notification Settings**: Toggle various notification types
- **Test Functionality**: Test alert generation for system validation

## 🔧 **Technical Implementation**

### **Monitoring Configuration**
```typescript
interface VisitMonitoringConfig {
  gracePeriodMinutes: number        // Default: 10 minutes
  escalationThresholdMinutes: number // Default: 30 minutes
  checkIntervalMinutes: number      // Default: 2 minutes
  autoEscalate: boolean            // Default: true
  notifyAdmins: boolean            // Default: true
  notifySupervisors: boolean        // Default: true
  sendPushNotifications: boolean    // Default: true
  sendEmailNotifications: boolean   // Default: true
}
```

### **Alert Generation Logic**
1. **Visit Detection**: Monitor visits with status 'scheduled' or 'late'
2. **Time Comparison**: Compare current time with scheduled start time
3. **Grace Period Check**: Allow configurable grace period before alerting
4. **Status Verification**: Check for actual_start_time or arrival confirmation
5. **Alert Creation**: Generate appropriate alert based on delay duration
6. **Notification Delivery**: Send notifications via multiple channels

### **Escalation Levels**
- **Initial (0-30 minutes)**: Warning alert with basic information
- **Escalated (30-60 minutes)**: Critical alert with supervisor notification
- **Critical (60+ minutes)**: Urgent alert with immediate action required

## 📱 **Notification Examples**

### **Dashboard Notification**
```
Late Visit Alert: Agent Ahmed Ibrahim hasn't arrived for Visit #V123 (Client: Nile Supplies). 
Scheduled: 11:00 — Current: 11:10 — Delay: 10 min. Action: Call agent or reassign.
```

### **Push/Email Subject**
```
Late Visit — Visit #V123 — Agent Ahmed Ibrahim — 10 minutes late
```

### **Email Body**
```
Agent Ahmed Ibrahim is 10 minutes late for Visit #V123 at Nile Supplies (scheduled 11:00). 
Last known status: Location not updated. Please call the agent or reassign. 
[Open Visit] [Call Agent]
```

## 🎛️ **Configuration Options**

### **Grace Period Settings**
- **Range**: 1-60 minutes
- **Default**: 10 minutes
- **Purpose**: Time allowed before considering a visit late

### **Escalation Threshold**
- **Range**: 5-120 minutes
- **Default**: 30 minutes
- **Purpose**: Time before escalating to supervisors

### **Check Interval**
- **Range**: 1-10 minutes
- **Default**: 2 minutes
- **Purpose**: How often to check for late visits

### **Notification Types**
- ✅ **Admin Notifications**: Dashboard and internal messaging
- ✅ **Push Notifications**: Mobile device alerts
- ✅ **Email Notifications**: Detailed email alerts
- ✅ **Supervisor Escalation**: Automatic escalation to supervisors

## 🚀 **Usage Instructions**

### **1. Start Monitoring**
1. Navigate to **Alerts & Notifications** tab
2. Click on **Late Visit Monitoring** tab
3. Click **Start Monitoring** button
4. Configure settings as needed

### **2. Configure Settings**
1. Adjust **Grace Period** (minutes before considering late)
2. Set **Escalation Threshold** (minutes before escalating)
3. Configure **Check Interval** (monitoring frequency)
4. Toggle notification types as needed

### **3. Monitor Alerts**
1. View real-time monitoring status
2. Check alert examples and formats
3. Test alert generation
4. Monitor escalation status

## 🔍 **Alert Details Included**

### **Visit Information**
- Visit ID and customer details
- Scheduled vs. current time
- Delay duration in minutes
- Agent contact information

### **Agent Status**
- Last known status (available, busy, offline, etc.)
- Last known location
- Contact information (phone, email)

### **Recommended Actions**
- **Initial**: "Call agent or reassign visit"
- **Escalated**: "Call agent or reassign visit to supervisor"
- **Critical**: "URGENT: Call agent immediately or reassign visit to backup agent"

## 📊 **Database Integration**

### **Visit Management Table Updates**
- Updates `status` to 'late' when grace period exceeded
- Sets `is_late` flag to true
- Updates `alert_type` to 'late_arrival'
- Sets appropriate `alert_severity` based on delay
- Stores alert message and admin notification status

### **Alert Metadata**
```typescript
metadata: {
  visitId: string
  delegateId: string
  delegatePhone: string
  customerName: string
  customerAddress: string
  scheduledTime: string
  currentTime: string
  delayMinutes: number
  lastKnownStatus: string
  lastKnownLocation: string
  escalationLevel: 'initial' | 'escalated' | 'critical'
  gracePeriodMinutes: number
  escalationThresholdMinutes: number
}
```

## 🛠️ **System Requirements**

### **Dependencies**
- Supabase database connection
- Visit management table with proper schema
- Notification system integration
- Real-time monitoring capabilities

### **Database Schema Requirements**
- `visit_management` table with all required fields
- Proper indexes on `scheduled_start_time` and `status`
- Alert and notification tracking fields

## 🔧 **Maintenance**

### **Monitoring Status**
- Check monitoring status in the dashboard
- Verify configuration settings
- Test alert generation
- Monitor escalation effectiveness

### **Troubleshooting**
- Ensure database connectivity
- Verify visit data integrity
- Check notification delivery
- Monitor system performance

## 📈 **Performance Considerations**

### **Optimization**
- Efficient database queries with proper indexing
- Configurable check intervals to balance responsiveness and performance
- Duplicate alert prevention to avoid spam
- Graceful error handling and logging

### **Scalability**
- Singleton pattern for monitoring instance
- Configurable monitoring parameters
- Efficient memory usage with alert cleanup
- Real-time status updates

## 🎯 **Future Enhancements**

### **Planned Features**
- SMS notification integration
- Advanced escalation workflows
- Historical alert analytics
- Custom notification templates
- Integration with external communication systems

### **Advanced Monitoring**
- Predictive late visit detection
- Route optimization suggestions
- Agent performance analytics
- Customer impact assessment

---

## 📞 **Support**

For technical support or questions about the late visit notification system, please refer to the system documentation or contact the development team.

**System Status**: ✅ Active and Monitoring
**Last Updated**: Current Implementation
**Version**: 1.0.0
