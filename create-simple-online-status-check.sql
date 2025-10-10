-- Simple and Reliable Online Status Check
-- This function directly checks the representative_live_locations table
-- to determine if a representative is online or offline

-- Function to get representatives with their actual online status
CREATE OR REPLACE FUNCTION public.get_representatives_with_actual_status()
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
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    last_seen timestamp with time zone,
    is_online boolean,
    seconds_since_last_location numeric,
    latitude numeric(10, 8),
    longitude numeric(11, 8),
    accuracy numeric(8, 2),
    altitude numeric(10, 2),
    speed numeric(8, 2),
    heading numeric(6, 2),
    battery_level integer,
    is_charging boolean,
    network_type text
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
        ll.timestamp AS last_seen,
        -- Simple check: online if location within last 65 seconds
        (ll.timestamp IS NOT NULL AND ll.timestamp > now() - INTERVAL '65 seconds') AS is_online,
        -- Calculate exact seconds since last location
        CASE 
            WHEN ll.timestamp IS NOT NULL THEN 
                EXTRACT(EPOCH FROM (now() - ll.timestamp))
            ELSE NULL
        END AS seconds_since_last_location,
        ll.latitude,
        ll.longitude,
        ll.accuracy,
        ll.altitude,
        ll.speed,
        ll.heading,
        ll.battery_level,
        ll.is_charging,
        ll.network_type
    FROM
        public.representatives r
    LEFT JOIN LATERAL (
        SELECT *
        FROM public.representative_live_locations
        WHERE representative_id = r.id
        ORDER BY timestamp DESC
        LIMIT 1
    ) ll ON true
    ORDER BY r.name;
END;
$$ LANGUAGE plpgsql;

-- Function to get only online representatives (with actual data)
CREATE OR REPLACE FUNCTION public.get_online_representatives_actual()
RETURNS TABLE (
    id text,
    name text,
    email text,
    phone text,
    last_seen timestamp with time zone,
    seconds_since_location numeric,
    latitude numeric(10, 8),
    longitude numeric(11, 8)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id,
        r.name,
        r.email,
        r.phone,
        ll.timestamp AS last_seen,
        EXTRACT(EPOCH FROM (now() - ll.timestamp)) AS seconds_since_location,
        ll.latitude,
        ll.longitude
    FROM
        public.representatives r
    INNER JOIN public.representative_live_locations ll ON ll.representative_id = r.id
    WHERE 
        -- Only representatives with location within last 65 seconds
        ll.timestamp > now() - INTERVAL '65 seconds'
        -- Get only the latest location for each representative
        AND ll.timestamp = (
            SELECT MAX(timestamp) 
            FROM public.representative_live_locations 
            WHERE representative_id = r.id
        )
    ORDER BY r.name;
END;
$$ LANGUAGE plpgsql;

-- Function to get only offline representatives (with actual data)
CREATE OR REPLACE FUNCTION public.get_offline_representatives_actual()
RETURNS TABLE (
    id text,
    name text,
    email text,
    phone text,
    last_seen timestamp with time zone,
    seconds_since_location numeric
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id,
        r.name,
        r.email,
        r.phone,
        ll.timestamp AS last_seen,
        CASE 
            WHEN ll.timestamp IS NOT NULL THEN 
                EXTRACT(EPOCH FROM (now() - ll.timestamp))
            ELSE NULL
        END AS seconds_since_location
    FROM
        public.representatives r
    LEFT JOIN public.representative_live_locations ll ON ll.representative_id = r.id
    WHERE 
        -- Representatives with no location or location older than 65 seconds
        (ll.timestamp IS NULL OR ll.timestamp <= now() - INTERVAL '65 seconds')
        -- Get only the latest location for each representative
        AND (ll.timestamp IS NULL OR ll.timestamp = (
            SELECT MAX(timestamp) 
            FROM public.representative_live_locations 
            WHERE representative_id = r.id
        ))
    ORDER BY r.name;
END;
$$ LANGUAGE plpgsql;

-- Function to update representative status based on actual location data
CREATE OR REPLACE FUNCTION public.update_representative_status_from_actual_data()
RETURNS TABLE (
    representative_id text,
    name text,
    old_status text,
    new_status text,
    last_seen timestamp with time zone,
    seconds_since_location numeric,
    is_online boolean
) AS $$
DECLARE
    rep_record RECORD;
    latest_location RECORD;
    is_online_status boolean;
    seconds_since_location numeric;
BEGIN
    -- Loop through all representatives
    FOR rep_record IN 
        SELECT id, name, status 
        FROM public.representatives
        ORDER BY name
    LOOP
        -- Get the latest location for this representative
        SELECT *
        INTO latest_location
        FROM public.representative_live_locations
        WHERE representative_id = rep_record.id
        ORDER BY timestamp DESC
        LIMIT 1;

        -- Calculate seconds since last location
        IF latest_location.timestamp IS NOT NULL THEN
            seconds_since_location := EXTRACT(EPOCH FROM (now() - latest_location.timestamp));
        ELSE
            seconds_since_location := NULL;
        END IF;

        -- Check if online (location within last 65 seconds)
        is_online_status := (latest_location.timestamp IS NOT NULL AND latest_location.timestamp > now() - INTERVAL '65 seconds');

        -- Update status based on actual data
        IF is_online_status AND rep_record.status != 'active' THEN
            UPDATE public.representatives
            SET status = 'active', updated_at = now()
            WHERE id = rep_record.id;
            
            RETURN QUERY SELECT 
                rep_record.id,
                rep_record.name,
                rep_record.status,
                'active'::text,
                latest_location.timestamp,
                seconds_since_location,
                true;
                
        ELSIF NOT is_online_status AND rep_record.status != 'offline' THEN
            UPDATE public.representatives
            SET status = 'offline', updated_at = now()
            WHERE id = rep_record.id;
            
            RETURN QUERY SELECT 
                rep_record.id,
                rep_record.name,
                rep_record.status,
                'offline'::text,
                latest_location.timestamp,
                seconds_since_location,
                false;
        ELSE
            -- No status change needed, but return current status
            RETURN QUERY SELECT 
                rep_record.id,
                rep_record.name,
                rep_record.status,
                rep_record.status,
                latest_location.timestamp,
                seconds_since_location,
                is_online_status;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to check if a specific representative is online
CREATE OR REPLACE FUNCTION public.is_representative_online(rep_id text)
RETURNS boolean AS $$
DECLARE
    latest_timestamp timestamp with time zone;
BEGIN
    -- Get the latest location timestamp for this representative
    SELECT timestamp
    INTO latest_timestamp
    FROM public.representative_live_locations
    WHERE representative_id = rep_id
    ORDER BY timestamp DESC
    LIMIT 1;

    -- Return true if location within last 65 seconds
    RETURN (latest_timestamp IS NOT NULL AND latest_timestamp > now() - INTERVAL '65 seconds');
END;
$$ LANGUAGE plpgsql;

-- Function to get representative online status with details
CREATE OR REPLACE FUNCTION public.get_representative_status_details(rep_id text)
RETURNS TABLE (
    representative_id text,
    name text,
    is_online boolean,
    last_seen timestamp with time zone,
    seconds_since_location numeric,
    latitude numeric(10, 8),
    longitude numeric(11, 8),
    accuracy numeric(8, 2),
    battery_level integer,
    is_charging boolean,
    network_type text
) AS $$
DECLARE
    latest_location RECORD;
    is_online_status boolean;
    seconds_since_location numeric;
BEGIN
    -- Get the latest location for this representative
    SELECT *
    INTO latest_location
    FROM public.representative_live_locations
    WHERE representative_id = rep_id
    ORDER BY timestamp DESC
    LIMIT 1;

    -- Calculate seconds since last location
    IF latest_location.timestamp IS NOT NULL THEN
        seconds_since_location := EXTRACT(EPOCH FROM (now() - latest_location.timestamp));
    ELSE
        seconds_since_location := NULL;
    END IF;

    -- Check if online (location within last 65 seconds)
    is_online_status := (latest_location.timestamp IS NOT NULL AND latest_location.timestamp > now() - INTERVAL '65 seconds');

    -- Get representative name
    SELECT name INTO latest_location.name FROM public.representatives WHERE id = rep_id;

    -- Return status details
    RETURN QUERY SELECT 
        rep_id,
        latest_location.name,
        is_online_status,
        latest_location.timestamp,
        seconds_since_location,
        latest_location.latitude,
        latest_location.longitude,
        latest_location.accuracy,
        latest_location.battery_level,
        latest_location.is_charging,
        latest_location.network_type;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_representatives_with_actual_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_online_representatives_actual() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_offline_representatives_actual() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_representative_status_from_actual_data() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_representative_online(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_representative_status_details(text) TO authenticated;
