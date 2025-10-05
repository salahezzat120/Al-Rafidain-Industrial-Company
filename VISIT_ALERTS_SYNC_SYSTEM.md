# Visit Alerts Sync System

## 🎯 **Overview**

A comprehensive system that automatically synchronizes alerts from the visit management table to the unified alerts & notifications system, ensuring all visit-related alerts appear in the centralized alerts dashboard.

## ✅ **Implemented Features**

### **1. Automatic Synchronization (`lib/visit-alerts-sync.ts`)**
- **Real-time Sync**: Automatically syncs every 2 minutes
- **Smart Mapping**: Maps visit management alert types to unified alert types
- **Duplicate Prevention**: Updates existing alerts instead of creating duplicates
- **Error Handling**: Robust error handling with detailed logging
- **Status Tracking**: Tracks sync status and last sync time

### **2. Alert Type Mapping**
- **`late_arrival`** → **`late_visit`** (Late visit alerts)
- **`time_exceeded`** → **`visit`** (Time exceeded alerts)
- **`no_show`** → **`visit`** (No show alerts)
- **`early_completion`** → **`visit`** (Early completion alerts)

### **3. Severity & Priority Mapping**
- **Severity**: Maps `low`, `medium`, `high`, `critical` from visit management
- **Priority**: Maps visit priority to unified priority system
- **Escalation**: Determines escalation level based on delay and severity

### **4. Enhanced Alerts Tab Integration**
- **New "Visit Alerts Sync" Tab**: Dedicated interface for sync management
- **Real-time Status**: Shows sync status and last sync time
- **Manual Controls**: Start/stop sync, manual sync, force sync all
- **Statistics**: Shows synced alerts count and performance metrics

## 🔧 **Technical Implementation**

### **Sync Process Flow**
1. **Read Visit Alerts**: Queries `visit_management` table for alerts
2. **Check Existing**: Verifies if alert already exists in unified table
3. **Map Data**: Transforms visit management data to unified format
4. **Create/Update**: Creates new alerts or updates existing ones
5. **Track Status**: Records sync status and timestamps

### **Data Transformation**
```typescript
// Visit Management → Unified Alerts
{
  alert_type: 'late_arrival' → alert_type: 'late_visit'
  alert_severity: 'high' → severity: 'high'
  priority: 'urgent' → priority: 'critical'
  delegate_name → delegate_name
  customer_name → customer_name
  alert_message → message
  // + additional metadata and tracking fields
}
```

### **Automatic Features**
- **Auto-start**: Sync starts automatically when alerts tab loads
- **Interval Sync**: Runs every 2 minutes automatically
- **Smart Updates**: Only updates changed alerts
- **Error Recovery**: Continues syncing even if individual alerts fail

## 📱 **User Interface**

### **Visit Alerts Sync Tab**
- **Status Card**: Shows sync status and last sync time
- **Manual Controls**: Buttons for manual sync operations
- **Statistics**: Real-time sync statistics and metrics
- **Instructions**: Clear explanation of how sync works

### **Sync Controls**
- **Start Sync**: Start automatic synchronization
- **Stop Sync**: Stop automatic synchronization
- **Sync Now**: Manual immediate sync
- **Force Sync All**: Force sync all visit alerts
- **Refresh Status**: Update sync status display

## 🚀 **Usage Instructions**

### **1. Automatic Operation**
The system starts automatically when you open the Alerts & Notifications tab:
- ✅ Sync starts automatically
- ✅ Runs every 2 minutes
- ✅ Shows status in the Visit Alerts Sync tab
- ✅ Logs all operations to console

### **2. Manual Control**
1. Go to **Alerts & Notifications** tab
2. Click on **Visit Alerts Sync** tab
3. Use controls to start/stop/manual sync
4. Monitor sync status and statistics

### **3. Monitoring**
- **Console Logs**: Detailed sync operation logs
- **Status Display**: Real-time sync status
- **Statistics**: Number of synced alerts
- **Error Tracking**: Failed sync attempts

## 🔍 **Alert Data Included**

### **From Visit Management Table**
- Visit ID and customer information
- Delegate details (name, phone, email)
- Alert type and severity
- Alert message and timestamps
- Visit scheduling information
- Status and priority data

### **Enhanced in Unified Table**
- Mapped alert types and severities
- Escalation level determination
- Notification settings
- Metadata and tracking
- Source system identification

## 📊 **Sync Statistics**

### **Real-time Metrics**
- **Synced Visit Alerts**: Count of alerts synced to unified table
- **Active Visit Alerts**: Current active visit alerts
- **Sync Interval**: Time between automatic syncs
- **Last Sync**: Timestamp of last successful sync

### **Performance Tracking**
- **Sync Success Rate**: Percentage of successful syncs
- **Error Count**: Number of failed sync attempts
- **Processing Time**: Time taken for sync operations
- **Data Volume**: Number of alerts processed

## 🛠️ **Configuration Options**

### **Sync Settings**
- **Interval**: Configurable sync interval (default: 2 minutes)
- **Auto-start**: Automatically start sync on tab load
- **Error Handling**: Continue on individual alert failures
- **Logging**: Detailed console logging for debugging

### **Alert Mapping**
- **Type Mapping**: Customizable alert type mapping
- **Severity Mapping**: Configurable severity levels
- **Priority Mapping**: Adjustable priority mapping
- **Escalation Rules**: Customizable escalation logic

## 🔧 **Database Integration**

### **Source Table: `visit_management`**
- Reads alerts with `alert_type` and `alert_message`
- Filters for unread alerts (`is_alert_read = false`)
- Includes all visit and delegate information
- Tracks alert creation and modification times

### **Target Table: `unified_alerts_notifications`**
- Stores synced alerts with enhanced metadata
- Maintains relationship to original visit records
- Tracks sync status and timestamps
- Supports all notification types

## 🐛 **Troubleshooting**

### **Common Issues**
1. **No Alerts Syncing**: Check if visit management table has alerts
2. **Sync Not Starting**: Verify sync is enabled in the tab
3. **Missing Data**: Check console logs for error messages
4. **Performance Issues**: Monitor sync interval and data volume

### **Debug Information**
- **Console Logs**: Detailed operation logs
- **Sync Status**: Real-time status display
- **Error Messages**: Clear error descriptions
- **Statistics**: Performance metrics

## 📈 **Benefits**

### **Centralized Management**
- All alerts in one unified system
- Consistent alert handling across systems
- Unified notification delivery
- Centralized alert statistics

### **Real-time Synchronization**
- Automatic sync every 2 minutes
- Immediate manual sync capability
- Real-time status monitoring
- Error recovery and retry logic

### **Enhanced Functionality**
- Mapped alert types and severities
- Escalation level determination
- Rich metadata and tracking
- Historical sync records

## 🎯 **Future Enhancements**

### **Planned Features**
- **Custom Sync Intervals**: User-configurable sync timing
- **Selective Sync**: Sync specific alert types only
- **Batch Operations**: Bulk sync operations
- **Advanced Filtering**: Filter alerts before sync

### **Integration Improvements**
- **Real-time Updates**: WebSocket-based real-time sync
- **Conflict Resolution**: Handle concurrent modifications
- **Sync History**: Detailed sync operation history
- **Performance Optimization**: Optimized sync algorithms

---

## 📞 **Support**

For technical support or questions about the visit alerts sync system, please refer to the system documentation or check the console logs for detailed operation information.

**System Status**: ✅ Active and Syncing
**Last Updated**: Current Implementation
**Version**: 1.0.0
