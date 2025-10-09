-- Fix Representative Online Status Issue
-- This script creates a function to properly determine online/offline status

-- Create a function to get representatives with proper online status
CREATE OR REPLACE FUNCTION public.get_representatives_with_status()
RETURNS TABLE (
  id text,
  name text,
  email text,
  phone text,
  address text,
  license_number text,
  emergency_contact text,
  vehicle text,
  status text,
  coverage_areas text[],
  transportation_type text,
  avatar_url text,
  created_at timestamptz,
  updated_at timestamptz,
  latitude numeric,
  longitude numeric,
  accuracy numeric,
  altitude numeric,
  speed numeric,
  heading numeric,
  timestamp timestamptz,
  battery_level integer,
  is_charging boolean,
  network_type text,
  is_online boolean,
  last_seen timestamptz,
  minutes_ago integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.name,
    r.email,
    r.phone,
    r.address,
    r.license_number,
    r.emergency_contact,
    r.vehicle,
    r.status,
    r.coverage_areas,
    r.transportation_type,
    r.avatar_url,
    r.created_at,
    r.updated_at,
    loc.latitude,
    loc.longitude,
    loc.accuracy,
    loc.altitude,
    loc.speed,
    loc.heading,
    loc.timestamp,
    loc.battery_level,
    loc.is_charging,
    loc.network_type,
    -- More lenient online status: 30 minutes instead of 5 minutes
    CASE 
      WHEN loc.timestamp IS NULL THEN false
      WHEN loc.timestamp > (NOW() - INTERVAL '30 minutes') THEN true
      ELSE false
    END as is_online,
    loc.timestamp as last_seen,
    CASE 
      WHEN loc.timestamp IS NULL THEN NULL
      ELSE EXTRACT(EPOCH FROM (NOW() - loc.timestamp))::integer / 60
    END as minutes_ago
  FROM public.representatives r
  LEFT JOIN LATERAL (
    SELECT *
    FROM public.representative_live_locations rll
    WHERE rll.representative_id = r.id
    ORDER BY rll.timestamp DESC
    LIMIT 1
  ) loc ON true
  ORDER BY r.name;
END;
$$ LANGUAGE plpgsql;

-- Create a function to update representative status based on location activity
CREATE OR REPLACE FUNCTION public.update_representative_status_from_locations()
RETURNS void AS $$
BEGIN
  -- Update representatives to 'active' if they have recent location data (within 30 minutes)
  UPDATE public.representatives 
  SET status = 'active', updated_at = NOW()
  WHERE id IN (
    SELECT DISTINCT representative_id 
    FROM public.representative_live_locations 
    WHERE timestamp > (NOW() - INTERVAL '30 minutes')
  );
  
  -- Update representatives to 'offline' if they don't have recent location data
  UPDATE public.representatives 
  SET status = 'offline', updated_at = NOW()
  WHERE id NOT IN (
    SELECT DISTINCT representative_id 
    FROM public.representative_live_locations 
    WHERE timestamp > (NOW() - INTERVAL '30 minutes')
  );
END;
$$ LANGUAGE plpgsql;

-- Create a function to get online/offline statistics
CREATE OR REPLACE FUNCTION public.get_representative_status_stats()
RETURNS TABLE (
  total_representatives integer,
  online_representatives integer,
  offline_representatives integer,
  active_representatives integer,
  inactive_representatives integer,
  last_activity timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::integer as total_representatives,
    COUNT(CASE WHEN loc.timestamp > (NOW() - INTERVAL '30 minutes') THEN 1 END)::integer as online_representatives,
    COUNT(CASE WHEN loc.timestamp IS NULL OR loc.timestamp <= (NOW() - INTERVAL '30 minutes') THEN 1 END)::integer as offline_representatives,
    COUNT(CASE WHEN r.status = 'active' THEN 1 END)::integer as active_representatives,
    COUNT(CASE WHEN r.status = 'inactive' THEN 1 END)::integer as inactive_representatives,
    MAX(loc.timestamp) as last_activity
  FROM public.representatives r
  LEFT JOIN LATERAL (
    SELECT timestamp
    FROM public.representative_live_locations rll
    WHERE rll.representative_id = r.id
    ORDER BY rll.timestamp DESC
    LIMIT 1
  ) loc ON true;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update representative status when location is updated
CREATE OR REPLACE FUNCTION public.trigger_update_representative_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the representative's status based on the new location
  UPDATE public.representatives 
  SET 
    status = CASE 
      WHEN NEW.timestamp > (NOW() - INTERVAL '30 minutes') THEN 'active'
      ELSE 'offline'
    END,
    updated_at = NOW()
  WHERE id = NEW.representative_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS update_representative_status_trigger ON public.representative_live_locations;
CREATE TRIGGER update_representative_status_trigger
  AFTER INSERT OR UPDATE ON public.representative_live_locations
  FOR EACH ROW EXECUTE FUNCTION public.trigger_update_representative_status();

-- Update existing representatives based on their recent location activity
SELECT public.update_representative_status_from_locations();

-- Show the current status
SELECT * FROM public.get_representative_status_stats();

-- Success message
SELECT 'Representative online status system updated successfully!' as message;
