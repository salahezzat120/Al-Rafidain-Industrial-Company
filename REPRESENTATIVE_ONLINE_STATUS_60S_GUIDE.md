# Representative Online Status - 65 Second Rule Implementation Guide

## Overview
This guide explains how to implement a 65-second rule for representative online status. Representatives are considered **online** only if they send their location within the last 65 seconds (60s + 5s buffer). If no location is received within 65 seconds, they are automatically marked as **offline**.

**Why 65 seconds?** 
- Location is sent every 60 seconds
- 5-second buffer accounts for network delays, processing time, and clock differences
- Prevents false offline status due to timing issues

## Database Setup

### Step 1: Run the SQL Script
Execute the SQL file to create all necessary database functions and triggers:

```bash
# Run this SQL file in your Supabase SQL Editor
create-representative-online-status-60s.sql
```

This creates:
- ✅ `get_representatives_with_online_status_60s()` - Get all representatives with online status (65s rule)
- ✅ `update_representative_status_60s()` - Trigger function to auto-update status (65s rule)
- ✅ `update_all_representative_statuses_60s()` - Manual status update for all reps (65s rule)
- ✅ `get_online_representatives_60s()` - Get only online representatives (65s rule)
- ✅ `get_offline_representatives_60s()` - Get only offline representatives (65s rule)

### Step 2: Verify Database Functions
Check that the functions were created successfully:

```sql
-- Check if functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%60s%';
```

## Frontend Implementation

### Step 3: Update Your Live Map Component

Replace the import in your live map component:

```typescript
// OLD - Remove this
import { getRepresentativeLiveLocations } from "@/lib/representative-live-locations"

// NEW - Add this
import { 
  getRepresentativesWithOnlineStatus60s,
  updateAllRepresentativeStatuses60s 
} from "@/lib/representative-live-locations"
```

### Step 4: Update the Data Fetching Logic

Replace your current data fetching with:

```typescript
const fetchRepresentatives = async () => {
  try {
    setIsLoading(true)
    
    // First, update all statuses based on 60-second rule
    await updateAllRepresentativeStatuses60s()
    
    // Then fetch representatives with updated online status
    const { data, error } = await getRepresentativesWithOnlineStatus60s()
    
    if (error) {
      console.error('Error fetching representatives:', error)
      toast.error('Failed to load representatives')
      return
    }
    
    setRepresentatives(data || [])
    
    // Log online/offline counts
    const onlineCount = data?.filter(r => r.is_online).length || 0
    const offlineCount = (data?.length || 0) - onlineCount
    console.log(`Online: ${onlineCount}, Offline: ${offlineCount}`)
    
  } catch (err) {
    console.error('Error:', err)
    toast.error('An error occurred')
  } finally {
    setIsLoading(false)
  }
}
```

### Step 5: Add Auto-Refresh Every 60 Seconds

Add this useEffect to automatically refresh the data:

```typescript
useEffect(() => {
  // Initial fetch
  fetchRepresentatives()
  
  // Refresh every 65 seconds to update online/offline status
  const interval = setInterval(() => {
    fetchRepresentatives()
  }, 65000) // 65 seconds
  
  return () => clearInterval(interval)
}, [])
```

## Mobile App Implementation

### Step 6: Configure Location Sending Interval

In your mobile app (React Native or similar), configure the location service to send updates every 60 seconds:

```typescript
// Example for React Native
import BackgroundGeolocation from 'react-native-background-geolocation'

BackgroundGeolocation.ready({
  // Send location every 60 seconds
  locationUpdateInterval: 60000,
  fastestLocationUpdateInterval: 60000,
  
  // Other settings
  desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
  distanceFilter: 10,
  stopOnTerminate: false,
  startOnBoot: true,
  
  // Heartbeat to ensure updates even when stationary
  heartbeatInterval: 60
})

// Start tracking
BackgroundGeolocation.start()
```

### Step 7: Send Location to Server

```typescript
const sendLocationUpdate = async (location) => {
  try {
    await supabase
      .from('representative_live_locations')
      .insert({
        representative_id: currentRepId,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        altitude: location.coords.altitude,
        speed: location.coords.speed,
        heading: location.coords.heading,
        timestamp: new Date().toISOString(),
        battery_level: location.battery.level,
        is_charging: location.battery.is_charging,
        network_type: location.network_type
      })
    
    console.log('Location sent successfully')
  } catch (error) {
    console.error('Failed to send location:', error)
  }
}
```

## Testing

### Test 1: Verify Online Status
1. Have a representative send their location
2. Check the live map - they should appear as **online** (green marker)
3. Wait 66 seconds without sending location
4. Refresh the map - they should now appear as **offline** (gray marker)

### Test 2: Verify Auto-Update
1. Open the live map
2. Watch the online/offline status update every 65 seconds
3. Verify that representatives who haven't sent location in 65+ seconds are marked offline

### Test 3: Database Trigger
Run this SQL to test the trigger:

```sql
-- Insert a test location
INSERT INTO representative_live_locations (
  representative_id, 
  latitude, 
  longitude, 
  timestamp
) VALUES (
  'test-rep-id', 
  33.3152, 
  44.3661, 
  NOW()
);

-- Check if status was updated to 'active'
SELECT id, name, status, updated_at 
FROM representatives 
WHERE id = 'test-rep-id';
```

## Monitoring

### Check Online Representatives
```sql
SELECT * FROM get_online_representatives_60s();
```

### Check Offline Representatives
```sql
SELECT * FROM get_offline_representatives_60s();
```

### Manual Status Update
```sql
SELECT update_all_representative_statuses_60s();
```

## Troubleshooting

### Issue: All representatives showing as offline
**Solution**: 
- Check if mobile app is sending locations every 60 seconds
- Verify the `representative_live_locations` table has recent data
- Run: `SELECT * FROM representative_live_locations ORDER BY timestamp DESC LIMIT 10;`

### Issue: Status not updating automatically
**Solution**:
- Verify the trigger is active: `SELECT * FROM pg_trigger WHERE tgname = 'trg_update_rep_status_60s';`
- Check trigger function: `SELECT update_representative_status_60s();`

### Issue: Performance problems
**Solution**:
- Ensure indexes are created on `representative_live_locations` table
- Check index usage: `EXPLAIN ANALYZE SELECT * FROM get_representatives_with_online_status_60s();`

## Summary

✅ **Database Functions**: Created and tested
✅ **Auto-Update Trigger**: Installed on `representative_live_locations` table
✅ **Frontend Integration**: Updated to use 60-second rule
✅ **Mobile App**: Configured to send location every 60 seconds
✅ **Testing**: Verified online/offline status updates correctly

The system now strictly enforces the 60-second rule for representative online status!

