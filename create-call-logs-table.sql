-- Create call_logs table for tracking call attempts
CREATE TABLE IF NOT EXISTS public.call_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    representative_id TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    call_type TEXT NOT NULL CHECK (call_type IN ('outgoing', 'incoming')),
    status TEXT NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'connected', 'failed', 'completed', 'missed')),
    initiated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    connected_at TIMESTAMP WITH TIME ZONE NULL,
    ended_at TIMESTAMP WITH TIME ZONE NULL,
    duration_seconds INTEGER NULL,
    notes TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraint
    CONSTRAINT fk_call_logs_representative 
        FOREIGN KEY (representative_id) 
        REFERENCES public.representatives(id) 
        ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_call_logs_representative_id 
    ON public.call_logs(representative_id);

CREATE INDEX IF NOT EXISTS idx_call_logs_initiated_at 
    ON public.call_logs(initiated_at);

CREATE INDEX IF NOT EXISTS idx_call_logs_status 
    ON public.call_logs(status);

CREATE INDEX IF NOT EXISTS idx_call_logs_call_type 
    ON public.call_logs(call_type);

-- Enable Row Level Security
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view call logs" ON public.call_logs
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage call logs" ON public.call_logs
    FOR ALL USING (auth.role() = 'admin');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_call_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_call_logs_updated_at
    BEFORE UPDATE ON public.call_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_call_logs_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.call_logs IS 'Tracks all call attempts and their status';
COMMENT ON COLUMN public.call_logs.representative_id IS 'ID of the representative being called';
COMMENT ON COLUMN public.call_logs.phone_number IS 'Phone number used for the call';
COMMENT ON COLUMN public.call_logs.call_type IS 'Type of call: outgoing or incoming';
COMMENT ON COLUMN public.call_logs.status IS 'Current status of the call';
COMMENT ON COLUMN public.call_logs.duration_seconds IS 'Call duration in seconds (if completed)';
COMMENT ON COLUMN public.call_logs.notes IS 'Additional notes about the call';
