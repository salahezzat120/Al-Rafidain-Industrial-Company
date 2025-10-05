# Representative Message Monitoring System

## 🎯 **Overview**

A comprehensive system that automatically monitors messages from representatives in the chat support system and creates notifications in the unified alerts & notifications tab. This ensures that all representative communications are tracked and escalated appropriately.

## ✅ **Implemented Features**

### **1. Automatic Message Monitoring (`lib/representative-message-monitor.ts`)**
- **Real-time Monitoring**: Automatically checks for new representative messages every 1 minute
- **Smart Content Analysis**: Analyzes message content to determine priority and urgency
- **Automatic Notifications**: Creates alerts in the unified alerts system
- **Duplicate Prevention**: Tracks processed messages to avoid duplicates
- **Error Handling**: Robust error handling with detailed logging

### **2. Message Content Analysis**
- **Priority Detection**: Analyzes content for urgent keywords
- **Severity Mapping**: Maps message content to appropriate severity levels
- **Category Classification**: Automatically categorizes messages
- **Urgency Detection**: Identifies urgent messages requiring immediate attention

### **3. Alert Generation**
- **Unified Alerts**: Creates alerts in the `unified_alerts_notifications` table
- **Rich Metadata**: Includes message details, representative info, and analysis results
- **Notification Settings**: Configures appropriate notification channels
- **Tagging System**: Automatically tags messages for easy filtering

### **4. Enhanced Alerts Tab Integration**
- **New "Representative Messages" Tab**: Dedicated interface for message monitoring
- **Real-time Status**: Shows monitoring status and last check time
- **Manual Controls**: Start/stop monitoring, manual check, force check all
- **Statistics**: Shows message notifications count and performance metrics

## 🔧 **Technical Implementation**

### **Message Monitoring Process**
1. **Check New Messages**: Queries `chat_messages` table for new representative messages
2. **Content Analysis**: Analyzes message content for priority and urgency keywords
3. **Representative Lookup**: Fetches representative information for context
4. **Alert Creation**: Creates unified alerts with rich metadata
5. **Status Tracking**: Records monitoring status and timestamps

### **Content Analysis Keywords**
```typescript
// Priority Detection Keywords
const urgentKeywords = ['urgent', 'emergency', 'help', 'problem', 'issue', 'stuck', 'broken']
const highKeywords = ['important', 'asap', 'quick', 'fast', 'delay', 'late']
const criticalKeywords = ['critical', 'urgent', 'emergency', 'help', 'stuck', 'broken']

// Severity Mapping
'critical' → 'critical' priority
'high' → 'high' priority  
'medium' → 'medium' priority
'low' → 'low' priority
```

### **Alert Data Structure**
```typescript
{
  alert_id: `MSG_${messageId}_${timestamp}`,
  alert_type: 'user',
  category: 'warning' | 'critical' | 'info',
  severity: 'low' | 'medium' | 'high' | 'critical',
  priority: 'low' | 'medium' | 'high' | 'critical',
  title: 'Message from [Representative Name]',
  message: 'Representative sent a message: "[content preview]"',
  delegate_name: representative.name,
  delegate_phone: representative.phone,
  source_system: 'chat_support',
  metadata: {
    original_message_id: message.id,
    message_type: message.message_type,
    is_urgent: boolean,
    message_length: number
  }
}
```

## 📱 **User Interface**

### **Representative Messages Tab**
- **Monitoring Status Card**: Shows monitoring status and last check time
- **Manual Controls**: Buttons for manual message checking
- **Statistics**: Real-time message statistics and metrics
- **Instructions**: Clear explanation of how monitoring works

### **Monitoring Controls**
- **Start Monitoring**: Start automatic message monitoring
- **Stop Monitoring**: Stop automatic message monitoring
- **Check Messages**: Manual immediate message check
- **Force Check All**: Force check all representative messages
- **Refresh Status**: Update monitoring status display

## 🚀 **Usage Instructions**

### **1. Automatic Operation**
The system starts automatically when you open the Alerts & Notifications tab:
- ✅ Message monitoring starts automatically
- ✅ Runs every 1 minute
- ✅ Shows status in the Representative Messages tab
- ✅ Logs all operations to console

### **2. Manual Control**
1. Go to **Alerts & Notifications** tab
2. Click on **Representative Messages** tab
3. Use controls to start/stop/manual check
4. Monitor message status and statistics

### **3. Monitoring**
- **Console Logs**: Detailed monitoring operation logs
- **Status Display**: Real-time monitoring status
- **Statistics**: Number of message notifications
- **Error Tracking**: Failed monitoring attempts

## 🔍 **Message Data Included**

### **From Chat Messages Table**
- Message ID and representative ID
- Message content and type
- Sender type and timestamps
- Message metadata and attachments

### **Enhanced in Unified Alerts**
- Representative information (name, phone, email)
- Content analysis results (priority, urgency)
- Alert classification and tagging
- Notification settings and escalation

## 📊 **Monitoring Statistics**

### **Real-time Metrics**
- **Message Notifications**: Count of alerts created from messages
- **Urgent Messages**: Count of urgent message alerts
- **Check Interval**: Time between automatic checks
- **Last Check**: Timestamp of last successful check

### **Performance Tracking**
- **Processing Success Rate**: Percentage of successful message processing
- **Error Count**: Number of failed processing attempts
- **Processing Time**: Time taken for message analysis
- **Data Volume**: Number of messages processed

## 🛠️ **Configuration Options**

### **Monitoring Settings**
- **Interval**: Configurable check interval (default: 1 minute)
- **Auto-start**: Automatically start monitoring on tab load
- **Error Handling**: Continue on individual message failures
- **Logging**: Detailed console logging for debugging

### **Content Analysis**
- **Keyword Detection**: Customizable keyword lists for priority detection
- **Severity Mapping**: Configurable severity level mapping
- **Urgency Rules**: Adjustable urgency detection logic
- **Category Classification**: Customizable category mapping

## 🔧 **Database Integration**

### **Source Table: `chat_messages`**
- Reads messages with `sender_type = 'representative'`
- Filters for new messages since last check
- Includes all message content and metadata
- Tracks message creation timestamps

### **Target Table: `unified_alerts_notifications`**
- Stores message alerts with enhanced metadata
- Maintains relationship to original message records
- Tracks monitoring status and timestamps
- Supports all notification types

## 🐛 **Troubleshooting**

### **Common Issues**
1. **No Message Notifications**: Check if representatives are sending messages
2. **Monitoring Not Starting**: Verify monitoring is enabled in the tab
3. **Missing Data**: Check console logs for error messages
4. **Performance Issues**: Monitor check interval and message volume

### **Debug Information**
- **Console Logs**: Detailed operation logs
- **Monitoring Status**: Real-time status display
- **Error Messages**: Clear error descriptions
- **Statistics**: Performance metrics

## 📈 **Benefits**

### **Centralized Communication Management**
- All representative messages in one unified system
- Consistent alert handling across all communications
- Unified notification delivery for all message types
- Centralized communication statistics

### **Real-time Message Monitoring**
- Automatic monitoring every 1 minute
- Immediate manual check capability
- Real-time status monitoring
- Error recovery and retry logic

### **Enhanced Message Processing**
- Smart content analysis and priority detection
- Automatic urgency detection
- Rich metadata and tracking
- Historical message records

## 🎯 **Future Enhancements**

### **Planned Features**
- **Custom Monitoring Intervals**: User-configurable check timing
- **Selective Monitoring**: Monitor specific representative groups
- **Advanced Content Analysis**: AI-powered message analysis
- **Custom Keyword Lists**: User-defined priority keywords

### **Integration Improvements**
- **Real-time Updates**: WebSocket-based real-time monitoring
- **Message Filtering**: Filter messages before processing
- **Monitoring History**: Detailed monitoring operation history
- **Performance Optimization**: Optimized monitoring algorithms

---

## 📞 **Support**

For technical support or questions about the representative message monitoring system, please refer to the system documentation or check the console logs for detailed operation information.

**System Status**: ✅ Active and Monitoring
**Last Updated**: Current Implementation
**Version**: 1.0.0
