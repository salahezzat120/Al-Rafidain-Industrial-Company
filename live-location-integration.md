# Live Location Integration for Active Representatives

## Changes Made

### 1. Data Source Updated
- **Active Representatives** now determined by `representative_live_locations` table
- **Online Status**: Representatives who sent location within last 30 minutes
- **Real-time Tracking**: Based on actual location updates, not just status field

### 2. Database Queries
- **Representative Live Locations**: Fetches `representative_id, timestamp` ordered by timestamp
- **Time Filter**: Only considers locations from last 30 minutes
- **Unique Representatives**: Counts distinct representative IDs with recent locations

### 3. Logic Implementation
```javascript
// Determine active representatives based on recent location updates (within last 30 minutes)
const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
const recentLocations = liveLocations?.filter(location => 
  new Date(location.timestamp) > thirtyMinutesAgo
) || []

// Get unique representative IDs who have sent location recently
const onlineRepresentativeIds = [...new Set(recentLocations.map(loc => loc.representative_id))]
const activeRepresentatives = onlineRepresentativeIds.length
```

### 4. Dashboard Updates
- **Card Title**: Changed to "Online Representatives"
- **Main Metric**: Shows count of representatives with recent location updates
- **Subtitle**: "Location updated in last 30 min"
- **Icon**: UserCheck icon to represent online status

### 5. Time Window
- **30 Minutes**: Representatives are considered online if they sent location within last 30 minutes
- **Configurable**: Can be easily changed by modifying the time window
- **Real-time**: Updates automatically as new locations are received

### 6. Key Features
- ✅ **Real-time Data**: Based on actual location updates
- ✅ **Time-based**: Only recent locations count as "online"
- ✅ **Unique Count**: Each representative counted only once
- ✅ **Live Updates**: Dashboard refreshes to show current online status
- ✅ **Debug Info**: Shows online count in debug section

## Database Tables Used
- **`representative_live_locations`**: For determining online representatives
- **`representatives`**: For total representative count and vehicle info
- **`delivery_tasks`**: For completed delivery statistics

## Benefits
- **Accurate Online Status**: Based on actual location sharing
- **Real-time Updates**: Shows current online representatives
- **Performance**: Efficient queries with proper indexing
- **Scalable**: Works with any number of representatives

## How It Works
1. **Fetch Live Locations**: Get all recent location updates
2. **Filter by Time**: Only locations from last 30 minutes
3. **Count Unique IDs**: Count distinct representatives with recent locations
4. **Display Count**: Show as "Online Representatives" on dashboard

The dashboard now shows truly active representatives based on their live location sharing!
