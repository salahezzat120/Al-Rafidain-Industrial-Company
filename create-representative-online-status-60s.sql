-- Create function to update representative online status based on 60-second rule
-- Representatives are considered online only if they send location within last 60 seconds

-- Function to get representatives with their online status (60-second rule)
CREATE OR REPLACE FUNCTION public.get_representatives_with_online_status_60s()
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

-- Function to update representative status based on 60-second rule
CREATE OR REPLACE FUNCTION public.update_representative_status_60s()
RETURNS TRIGGER AS $$
DECLARE
    rep_id text;
    latest_timestamp timestamp with time zone;
    is_online_status boolean;
    current_status text;
BEGIN
    -- Get the representative ID from the new/updated record
    rep_id := NEW.representative_id;

    -- Get the latest location timestamp for this representative
    SELECT timestamp
    INTO latest_timestamp
    FROM public.representative_live_locations
    WHERE representative_id = rep_id
    ORDER BY timestamp DESC
    LIMIT 1;

    -- Check if representative is online (location within last 65 seconds - 60s + 5s buffer)
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
        END IF;
    ELSE
        -- If offline and currently not offline, update to offline
        IF current_status != 'offline' THEN
            UPDATE public.representatives
            SET status = 'offline', updated_at = now()
            WHERE id = rep_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update status when location is inserted/updated
DROP TRIGGER IF EXISTS trg_update_rep_status_60s ON public.representative_live_locations;

CREATE TRIGGER trg_update_rep_status_60s
    AFTER INSERT OR UPDATE ON public.representative_live_locations
    FOR EACH ROW EXECUTE FUNCTION public.update_representative_status_60s();

-- Function to manually update all representative statuses based on 60-second rule
CREATE OR REPLACE FUNCTION public.update_all_representative_statuses_60s()
RETURNS void AS $$
DECLARE
    rep_record RECORD;
    latest_timestamp timestamp with time zone;
    is_online_status boolean;
BEGIN
    -- Loop through all representatives
    FOR rep_record IN 
        SELECT id, status 
        FROM public.representatives
    LOOP
        -- Get latest location for this representative
        SELECT timestamp
        INTO latest_timestamp
        FROM public.representative_live_locations
        WHERE representative_id = rep_record.id
        ORDER BY timestamp DESC
        LIMIT 1;

        -- Check if online (location within last 65 seconds - 60s + 5s buffer)
        is_online_status := (latest_timestamp IS NOT NULL AND latest_timestamp > now() - INTERVAL '65 seconds');

        -- Update status if needed
        IF is_online_status AND rep_record.status != 'active' THEN
            UPDATE public.representatives
            SET status = 'active', updated_at = now()
            WHERE id = rep_record.id;
        ELSIF NOT is_online_status AND rep_record.status != 'offline' THEN
            UPDATE public.representatives
            SET status = 'offline', updated_at = now()
            WHERE id = rep_record.id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to get online representatives only (within last 60 seconds)
CREATE OR REPLACE FUNCTION public.get_online_representatives_60s()
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
    INNER JOIN LATERAL (
        SELECT *
        FROM public.representative_live_locations
        WHERE representative_id = r.id
        ORDER BY timestamp DESC
        LIMIT 1
    ) ll ON true
    WHERE 
        -- Only representatives with location within last 65 seconds (60s + 5s buffer)
        ll.timestamp > now() - INTERVAL '65 seconds'
    ORDER BY r.name;
END;
$$ LANGUAGE plpgsql;

-- Function to get offline representatives (no location within last 60 seconds)
CREATE OR REPLACE FUNCTION public.get_offline_representatives_60s()
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
    last_seen timestamp with time zone
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
        ll.timestamp AS last_seen
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
        -- Representatives with no location or location older than 65 seconds (60s + 5s buffer)
        (ll.timestamp IS NULL OR ll.timestamp <= now() - INTERVAL '65 seconds')
    ORDER BY r.name;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to update statuses every minute (optional)
-- This can be run by a cron job or scheduled task
CREATE OR REPLACE FUNCTION public.scheduled_status_update_60s()
RETURNS void AS $$
BEGIN
    -- Update all representative statuses
    PERFORM public.update_all_representative_statuses_60s();
    
    -- Log the update
    RAISE NOTICE 'Updated representative statuses based on 60-second rule at %', now();
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_representatives_with_online_status_60s() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_representative_status_60s() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_all_representative_statuses_60s() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_online_representatives_60s() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_offline_representatives_60s() TO authenticated;
GRANT EXECUTE ON FUNCTION public.scheduled_status_update_60s() TO authenticated;
