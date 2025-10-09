# Movement Tracking Features for Representative Tab

## Overview

This document describes the new movement tracking features added to the Representative tab, including historical logs, calendar view, and report generation capabilities.

## New Features Added

### 1. Movement Tracking (History Log)

**Location**: `components/admin/movement-tracking-modal.tsx`

**Features**:
- Complete movement history for each representative
- Date, time, and location tracking for all activities
- Activity types: check_in, check_out, delivery_start, delivery_complete, visit_start, visit_end, task_start, task_complete, idle
- Distance, duration, and speed tracking
- Battery level and network type monitoring
- Accuracy metrics for GPS data

**Database Schema**: `setup-movement-tracking-database.sql`
- `representative_movements` table for tracking all movements
- `representative_visits` table for specific visit records
- `representative_daily_summaries` table for daily activity summaries

### 2. Calendar View

**Features**:
- Interactive calendar for date selection
- Date range filtering
- Activity display for selected dates
- Visual representation of representative activities
- Easy navigation between different dates

**Implementation**:
- Uses `react-day-picker` for calendar functionality
- Date range picker for filtering movements
- Real-time activity display based on selected dates

### 3. View Historical Logs

**Features**:
- "View Movement History" button in representative dropdown menu
- Comprehensive activity log with filtering options
- Activity type filtering (check_in, delivery_start, etc.)
- Location-based filtering
- Date range filtering
- Real-time movement tracking

**Access Points**:
- Individual representative cards → More options → View Movement History
- Quick action buttons in the Movement Tracking section
- Direct access from representative profile

### 4. Download Report Feature

**Features**:
- PDF and Excel report generation
- Comprehensive movement data export
- Visit history inclusion
- Daily summaries and statistics
- Customizable date ranges
- Multiple export formats

**Report Contents**:
- Summary statistics (total movements, distance, duration)
- Detailed movement history with timestamps
- Visit records with customer information
- Daily activity summaries
- Performance metrics and analytics

## Database Schema

### Tables Created

1. **representative_movements**
   - Tracks all representative movements and activities
   - Includes GPS coordinates, timestamps, activity types
   - Stores distance, duration, speed, and accuracy data

2. **representative_visits**
   - Records specific customer visits and deliveries
   - Includes customer information and visit details
   - Tracks scheduled vs actual visit times

3. **representative_daily_summaries**
   - Daily activity summaries for each representative
   - Aggregated statistics and performance metrics
   - Check-in/check-out times and break durations

## User Interface Components

### 1. Movement Tracking Modal
- **File**: `components/admin/movement-tracking-modal.tsx`
- **Features**: 
  - Tabbed interface (Movements, Visits, Calendar, Reports)
  - Advanced filtering options
  - Real-time data display
  - Export functionality

### 2. Calendar Component
- **File**: `components/ui/calendar.tsx`
- **Features**:
  - Date selection and range picking
  - Activity visualization
  - Integration with movement data

### 3. Report Generator
- **File**: `lib/movement-reports.ts`
- **Features**:
  - Excel and PDF report generation
  - Customizable report content
  - Multiple export formats

## Usage Instructions

### For Administrators

1. **Access Movement Tracking**:
   - Go to Representative tab
   - Click on any representative's "More options" menu
   - Select "View Movement History"

2. **View Historical Data**:
   - Use the "Movements" tab to see all activities
   - Filter by activity type, date range, or location
   - View detailed information for each movement

3. **Calendar View**:
   - Switch to "Calendar" tab
   - Select specific dates to view activities
   - See daily activity summaries

4. **Generate Reports**:
   - Go to "Reports" tab
   - Select date range and filters
   - Download PDF or Excel reports

### Quick Actions

The Representative tab now includes quick action buttons:
- **View Historical Logs**: Access movement history for all representatives
- **Calendar View**: Select dates to view specific activities
- **Download Reports**: Generate comprehensive reports for all representatives

## Technical Implementation

### Type Definitions
- **File**: `types/movement-tracking.ts`
- **Includes**: Movement, Visit, Daily Summary interfaces
- **Features**: Comprehensive type safety for all movement tracking data

### Database Integration
- **File**: `setup-movement-tracking-database.sql`
- **Features**: Complete database schema with indexes and triggers
- **Sample Data**: Included for testing and development

### Report Generation
- **File**: `lib/movement-reports.ts`
- **Features**: Excel and PDF report generation
- **Customization**: Configurable report content and formatting

## Example Usage

```typescript
// Access movement tracking for a representative
const handleViewMovementHistory = (representative: any) => {
  setSelectedMovementRepresentative(representative);
  setIsMovementTrackingModalOpen(true);
};

// Generate and download report
const handleDownloadReport = async (format: 'pdf' | 'excel') => {
  const reportData = await fetchMovementData(representative.id, dateRange);
  const blob = await MovementReportGenerator.generateExcelReport(reportData, filters);
  MovementReportGenerator.downloadBlob(blob, filename);
};
```

## Future Enhancements

1. **Real-time Tracking**: Live GPS tracking integration
2. **Map Integration**: Visual map display of movements
3. **Advanced Analytics**: Performance metrics and insights
4. **Mobile App Integration**: Representative mobile app connectivity
5. **Automated Alerts**: Movement-based notifications and alerts

## Dependencies

- `react-day-picker`: Calendar functionality
- `xlsx`: Excel report generation
- `date-fns`: Date formatting and manipulation
- `lucide-react`: Icon components
- `@radix-ui/react-popover`: Popover components

## Testing

The implementation includes sample data for testing:
- Mock movement data with realistic timestamps
- Sample visit records with customer information
- Test statistics and analytics data

## Security Considerations

- All movement data is tied to specific representatives
- Date range filtering prevents unauthorized data access
- Report generation includes proper data validation
- Database queries include proper indexing for performance

## Performance Notes

- Database indexes created for optimal query performance
- Pagination support for large datasets
- Efficient filtering and search capabilities
- Optimized report generation for large data volumes
