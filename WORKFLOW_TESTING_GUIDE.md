# Workflow Integration Testing Guide

## 🎯 **Overview**
The Workflow Integration system connects warehouse operations with production, sales, delivery, and return processes. This guide shows you how to test it with real data.

## 🚀 **Quick Start Testing**

### **Step 1: Set Up Database Tables**
```bash
# Run the SQL script to create workflow_events table
psql -h localhost -U postgres -d your_database_name -f create-workflow-events-table.sql
```

### **Step 2: Create Sample Data**
1. **Go to Warehouse Management → Workflow tab**
2. **Click "Create Sample Data" button**
3. **This creates 4 sample workflow events** (Production, Sales, Delivery, Return)

### **Step 3: Test Workflow Processing**
1. **View events in each tab** (Production, Sales, Delivery, Returns)
2. **Click "Process" button** on any PENDING event
3. **Watch the status change** to COMPLETED
4. **Check Stock Movements tab** to see the created stock movements

## 📊 **What Each Workflow Type Does**

### **🏭 Production Events**
- **Purpose**: When new products are manufactured
- **Action**: Creates RECEIPT stock movement (adds inventory)
- **Example**: 1000 plastic cups produced → adds 1000 to warehouse inventory

### **🛒 Sales Events**
- **Purpose**: When products are sold to customers
- **Action**: Creates ISSUE stock movement (removes inventory)
- **Example**: 500 plastic plates sold → removes 500 from warehouse inventory

### **🚚 Delivery Events**
- **Purpose**: When products are delivered to customers
- **Action**: Creates ISSUE stock movement (removes inventory)
- **Example**: 200 plastic boxes delivered → removes 200 from warehouse inventory

### **📦 Return Events**
- **Purpose**: When customers return products
- **Action**: Creates RETURN stock movement (adds inventory back)
- **Example**: 50 plastic cups returned → adds 50 back to warehouse inventory

## 🧪 **Testing Scenarios**

### **Scenario 1: Complete Production Workflow**
1. **Create Production Event**:
   - Go to Workflow → Production tab
   - Click "Create Sample Data" if no events exist
   - Find a PENDING production event

2. **Process the Event**:
   - Click "Process" button
   - Event status changes to COMPLETED
   - Check Stock Movements tab for new RECEIPT movement

3. **Verify Inventory**:
   - Go to Products tab
   - Check that product stock increased
   - Go to Reports tab to see updated inventory

### **Scenario 2: Sales and Delivery Workflow**
1. **Process Sales Event**:
   - Go to Sales tab
   - Click "Process" on a sales event
   - Check Stock Movements for ISSUE movement

2. **Process Delivery Event**:
   - Go to Delivery tab
   - Click "Process" on a delivery event
   - Verify inventory decreased

### **Scenario 3: Return Processing**
1. **Process Return Event**:
   - Go to Returns tab
   - Click "Process" on a return event
   - Check Stock Movements for RETURN movement
   - Verify inventory increased

## 📈 **Real Data Integration**

### **Connect to Real Systems**
The workflow system is designed to integrate with:

1. **Production Systems**:
   - ERP systems
   - Manufacturing execution systems
   - Quality control systems

2. **Sales Systems**:
   - E-commerce platforms
   - CRM systems
   - Order management systems

3. **Delivery Systems**:
   - Logistics platforms
   - Shipping providers
   - Fleet management systems

4. **Return Systems**:
   - Customer service platforms
   - Return management systems
   - Quality control systems

### **API Integration Points**
```typescript
// Create workflow event from external system
await createWorkflowEvent({
  event_type: 'PRODUCTION',
  description: 'Batch #123 completed',
  description_ar: 'تم إكمال الدفعة رقم 123',
  warehouse_id: 1,
  product_id: 5,
  quantity: 1000,
  reference_number: 'BATCH-123'
});

// Process workflow event
await processWorkflowEvent(eventId);
```

## 🔍 **Monitoring and Analytics**

### **Workflow Statistics**
The system tracks:
- **Total Events**: All workflow events created
- **Pending Events**: Events waiting to be processed
- **Completed Events**: Successfully processed events
- **Failed Events**: Events that failed processing

### **Event Types Breakdown**
- **Production Events**: Manufacturing activities
- **Sales Events**: Customer orders
- **Delivery Events**: Shipping activities
- **Return Events**: Customer returns

## 🛠️ **Troubleshooting**

### **Common Issues**

1. **No Events Showing**:
   - Click "Create Sample Data" button
   - Check database connection
   - Verify workflow_events table exists

2. **Processing Fails**:
   - Check that products and warehouses exist
   - Verify RLS policies are correct
   - Check console for error messages

3. **Stock Movements Not Created**:
   - Ensure inventory table exists
   - Check RLS policies for stock_movements table
   - Verify product and warehouse IDs are valid

### **Database Queries for Debugging**
```sql
-- Check workflow events
SELECT * FROM workflow_events ORDER BY created_at DESC;

-- Check stock movements created by workflow
SELECT * FROM stock_movements WHERE notes LIKE '%event:%';

-- Check inventory levels
SELECT p.product_name, w.warehouse_name, i.available_quantity 
FROM inventory i
JOIN products p ON i.product_id = p.id
JOIN warehouses w ON i.warehouse_id = w.id;
```

## 📋 **Testing Checklist**

- [ ] Workflow events table created
- [ ] Sample data created successfully
- [ ] Production events can be processed
- [ ] Sales events can be processed
- [ ] Delivery events can be processed
- [ ] Return events can be processed
- [ ] Stock movements are created correctly
- [ ] Inventory levels update properly
- [ ] Statistics show correct counts
- [ ] Error handling works for invalid data

## 🎉 **Success Indicators**

✅ **Workflow Integration is working when:**
- Events appear in the correct tabs
- Processing changes status to COMPLETED
- Stock movements are created automatically
- Inventory levels update correctly
- Statistics show real-time data
- Error messages are clear and helpful

## 🔄 **Next Steps**

1. **Connect Real Systems**: Integrate with your actual production, sales, and delivery systems
2. **Customize Events**: Add your specific workflow event types
3. **Set Up Monitoring**: Create alerts for failed events
4. **Scale Up**: Process large volumes of workflow events
5. **Analytics**: Build dashboards for workflow performance

The workflow integration system is now fully functional and ready for real-world use!
