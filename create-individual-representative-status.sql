-- Individual Representative Status Check - Fixed Version
-- This version properly checks each representative's individual last location

-- Function to get representatives with their individual online status
CREATE OR REPLACE FUNCTION public.get_representatives_with_individual_status()
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
        -- Online if location was sent within last 65 seconds (60s + 5s buffer)
        (ll.timestamp IS NOT NULL AND ll.timestamp > now() - INTERVAL '65 seconds') AS is_online,
        -- Calculate seconds since last location
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

-- Function to update individual representative status based on their last location
CREATE OR REPLACE FUNCTION public.update_individual_representative_status(rep_id text)
RETURNS void AS $$
DECLARE
    latest_timestamp timestamp with time zone;
    is_online_status boolean;
    current_status text;
    seconds_since_location numeric;
BEGIN
    -- Get the latest location timestamp for this specific representative
    SELECT timestamp
    INTO latest_timestamp
    FROM public.representative_live_locations
    WHERE representative_id = rep_id
    ORDER BY timestamp DESC
    LIMIT 1;

    -- Calculate seconds since last location
    IF latest_timestamp IS NOT NULL THEN
        seconds_since_location := EXTRACT(EPOCH FROM (now() - latest_timestamp));
    ELSE
        seconds_since_location := NULL;
    END IF;

    -- Check if representative is online (location within last 65 seconds)
    is_online_status := (latest_timestamp IS NOT NULL AND latest_timestamp > now() - INTERVAL '65 seconds');

    -- Get current status
    SELECT status INTO current_status
    FROM public.representatives
    WHERE id = rep_id;

    -- Update status based on online status
    IF is_online_status THEN
        -- If online and currently not active, update to active
        IF current_status != 'active' THEN
            UPDATE public.representatives
            SET status = 'active', updated_at = now()
            WHERE id = rep_id;
            
            RAISE NOTICE 'Representative % marked as ACTIVE (last seen: % seconds ago)', 
                rep_id, COALESCE(seconds_since_location::integer, 'never');
        END IF;
    ELSE
        -- If offline and currently not offline, update to offline
        IF current_status != 'offline' THEN
            UPDATE public.representatives
            SET status = 'offline', updated_at = now()
            WHERE id = rep_id;
            
            RAISE NOTICE 'Representative % marked as OFFLINE (last seen: % seconds ago)', 
                rep_id, COALESCE(seconds_since_location::integer, 'never');
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update all representative statuses individually
CREATE OR REPLACE FUNCTION public.update_all_representative_statuses_individual()
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
    latest_timestamp timestamp with time zone;
    is_online_status boolean;
    current_status text;
    seconds_since_location numeric;
BEGIN
    -- Loop through all representatives individually
    FOR rep_record IN 
        SELECT id, name, status 
        FROM public.representatives
        ORDER BY name
    LOOP
        -- Get latest location for this specific representative
        SELECT timestamp
        INTO latest_timestamp
        FROM public.representative_live_locations
        WHERE representative_id = rep_record.id
        ORDER BY timestamp DESC
        LIMIT 1;

        -- Calculate seconds since last location
        IF latest_timestamp IS NOT NULL THEN
            seconds_since_location := EXTRACT(EPOCH FROM (now() - latest_timestamp));
        ELSE
            seconds_since_location := NULL;
        END IF;

        -- Check if online (location within last 65 seconds)
        is_online_status := (latest_timestamp IS NOT NULL AND latest_timestamp > now() - INTERVAL '65 seconds');

        -- Update status if needed
        IF is_online_status AND rep_record.status != 'active' THEN
            UPDATE public.representatives
            SET status = 'active', updated_at = now()
            WHERE id = rep_record.id;
            
            RETURN QUERY SELECT 
                rep_record.id,
                rep_record.name,
                rep_record.status,
                'active'::text,
                latest_timestamp,
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
                latest_timestamp,
                seconds_since_location,
                false;
        ELSE
            -- No status change needed
            RETURN QUERY SELECT 
                rep_record.id,
                rep_record.name,
                rep_record.status,
                rep_record.status,
                latest_timestamp,
                seconds_since_location,
                is_online_status;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to get online representatives only (individual check)
CREATE OR REPLACE FUNCTION public.get_online_representatives_individual()
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
    INNER JOIN LATERAL (
        SELECT *
        FROM public.representative_live_locations
        WHERE representative_id = r.id
        ORDER BY timestamp DESC
        LIMIT 1
    ) ll ON true
    WHERE 
        -- Only representatives with location within last 65 seconds
        ll.timestamp > now() - INTERVAL '65 seconds'
    ORDER BY r.name;
END;
$$ LANGUAGE plpgsql;

-- Function to get offline representatives only (individual check)
CREATE OR REPLACE FUNCTION public.get_offline_representatives_individual()
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
    LEFT JOIN LATERAL (
        SELECT timestamp
        FROM public.representative_live_locations
        WHERE representative_id = r.id
        ORDER BY timestamp DESC
        LIMIT 1
    ) ll ON true
    WHERE 
        -- Representatives with no location or location older than 65 seconds
        (ll.timestamp IS NULL OR ll.timestamp <= now() - INTERVAL '65 seconds')
    ORDER BY r.name;
END;
$$ LANGUAGE plpgsql;

-- Create a more intelligent trigger that updates individual representatives
CREATE OR REPLACE FUNCTION public.update_representative_status_on_location_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Update only the specific representative whose location was updated
    PERFORM public.update_individual_representative_status(NEW.representative_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop old trigger and create new one
DROP TRIGGER IF EXISTS trg_update_rep_status_60s ON public.representative_live_locations;

CREATE TRIGGER trg_update_rep_status_on_location_change
    AFTER INSERT OR UPDATE ON public.representative_live_locations
    FOR EACH ROW EXECUTE FUNCTION public.update_representative_status_on_location_change();

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_representatives_with_individual_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_individual_representative_status(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_all_representative_statuses_individual() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_online_representatives_individual() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_offline_representatives_individual() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_representative_status_on_location_change() TO authenticated;




