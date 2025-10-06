-- Create a PostgreSQL function to get the latest location for each representative
-- This function leverages the database indexes for optimal performance

CREATE OR REPLACE FUNCTION get_latest_representative_locations()
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
  representative_id text,
  latitude numeric(10,8),
  longitude numeric(11,8),
  accuracy numeric(8,2),
  altitude numeric(10,2),
  speed numeric(8,2),
  heading numeric(6,2),
  "timestamp" timestamptz,
  battery_level integer,
  is_charging boolean,
  network_type text,
  location_created_at timestamptz,
  representative_name text,
  representative_phone text,
  is_online boolean,
  last_seen timestamptz
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH latest_locations AS (
    SELECT DISTINCT ON (rll.representative_id)
      rll.representative_id,
      rll.latitude,
      rll.longitude,
      rll.accuracy,
      rll.altitude,
      rll.speed,
      rll.heading,
      rll."timestamp",
      rll.battery_level,
      rll.is_charging,
      rll.network_type,
      rll.created_at as location_created_at
    FROM representative_live_locations rll
    ORDER BY rll.representative_id, rll."timestamp" DESC
  )
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
    ll.representative_id,
    ll.latitude,
    ll.longitude,
    ll.accuracy,
    ll.altitude,
    ll.speed,
    ll.heading,
    ll."timestamp",
    ll.battery_level,
    ll.is_charging,
    ll.network_type,
    ll.location_created_at,
    r.name as representative_name,
    r.phone as representative_phone,
    CASE 
      WHEN ll."timestamp" IS NOT NULL 
        AND (EXTRACT(EPOCH FROM (NOW() - ll."timestamp")) / 60) <= 5 
      THEN true 
      ELSE false 
    END as is_online,
    ll."timestamp" as last_seen
  FROM representatives r
  LEFT JOIN latest_locations ll ON r.id = ll.representative_id
  ORDER BY r.name;
END;
$$;

-- Create an index to optimize the function performance
CREATE INDEX IF NOT EXISTS idx_live_locations_representative_timestamp_desc 
ON representative_live_locations (representative_id, "timestamp" DESC);

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_latest_representative_locations() TO authenticated;

-- Add a comment explaining the function
COMMENT ON FUNCTION get_latest_representative_locations() IS 
'Returns all representatives with their latest location data. Uses window functions and indexes for optimal performance.';
