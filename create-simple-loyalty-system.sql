-- Simple Loyalty System for Customers and Representatives
-- Run this in Supabase SQL Editor

-- 1. Customer Loyalty Points Table
CREATE TABLE IF NOT EXISTS public.customer_loyalty_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  points integer NOT NULL DEFAULT 0 CHECK (points >= 0),
  total_earned integer NOT NULL DEFAULT 0 CHECK (total_earned >= 0),
  total_redeemed integer NOT NULL DEFAULT 0 CHECK (total_redeemed >= 0),
  last_activity_date timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(customer_id)
);

-- 2. Customer Loyalty Transactions Table
CREATE TABLE IF NOT EXISTS public.customer_loyalty_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.delivery_tasks(id) ON DELETE SET NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('earned', 'redeemed', 'expired', 'admin_adjustment')),
  points integer NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Representative Loyalty Points Table
CREATE TABLE IF NOT EXISTS public.representative_loyalty_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  representative_id text NOT NULL REFERENCES public.representatives(id) ON DELETE CASCADE,
  points integer NOT NULL DEFAULT 0 CHECK (points >= 0),
  total_earned integer NOT NULL DEFAULT 0 CHECK (total_earned >= 0),
  total_redeemed integer NOT NULL DEFAULT 0 CHECK (total_redeemed >= 0),
  last_activity_date timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(representative_id)
);

-- 4. Representative Loyalty Transactions Table
CREATE TABLE IF NOT EXISTS public.representative_loyalty_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  representative_id text NOT NULL REFERENCES public.representatives(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.delivery_tasks(id) ON DELETE SET NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('earned', 'redeemed', 'expired', 'admin_adjustment')),
  points integer NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now()
);

-- 5. Loyalty Settings Table
CREATE TABLE IF NOT EXISTS public.loyalty_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Insert default loyalty settings
INSERT INTO public.loyalty_settings (setting_key, setting_value, description) VALUES
('customer_points_per_order', '10', 'Points earned per order by customer'),
('representative_points_per_order', '10', 'Points earned per order by representative'),
('customer_points_per_dollar', '0', 'Points earned per dollar spent by customer (disabled)'),
('representative_points_per_dollar', '0', 'Points earned per dollar spent by representative (disabled)'),
('points_expiry_days', '365', 'Days before points expire'),
('min_redeem_points', '100', 'Minimum points required for redemption')
ON CONFLICT (setting_key) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_loyalty_customer_id ON public.customer_loyalty_points(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_loyalty_transactions_customer_id ON public.customer_loyalty_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_loyalty_transactions_created_at ON public.customer_loyalty_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_customer_loyalty_transactions_type ON public.customer_loyalty_transactions(transaction_type);

CREATE INDEX IF NOT EXISTS idx_representative_loyalty_representative_id ON public.representative_loyalty_points(representative_id);
CREATE INDEX IF NOT EXISTS idx_representative_loyalty_transactions_representative_id ON public.representative_loyalty_transactions(representative_id);
CREATE INDEX IF NOT EXISTS idx_representative_loyalty_transactions_created_at ON public.representative_loyalty_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_representative_loyalty_transactions_type ON public.representative_loyalty_transactions(transaction_type);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER update_customer_loyalty_points_updated_at
  BEFORE UPDATE ON public.customer_loyalty_points
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_representative_loyalty_points_updated_at
  BEFORE UPDATE ON public.representative_loyalty_points
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_loyalty_settings_updated_at
  BEFORE UPDATE ON public.loyalty_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE public.customer_loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.representative_loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.representative_loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_settings ENABLE ROW LEVEL SECURITY;

-- Create permissive RLS policies (adjust as needed for your security requirements)
CREATE POLICY "Allow all operations on customer_loyalty_points" ON public.customer_loyalty_points FOR ALL USING (true);
CREATE POLICY "Allow all operations on customer_loyalty_transactions" ON public.customer_loyalty_transactions FOR ALL USING (true);
CREATE POLICY "Allow all operations on representative_loyalty_points" ON public.representative_loyalty_points FOR ALL USING (true);
CREATE POLICY "Allow all operations on representative_loyalty_transactions" ON public.representative_loyalty_transactions FOR ALL USING (true);
CREATE POLICY "Allow all operations on loyalty_settings" ON public.loyalty_settings FOR ALL USING (true);

-- Create functions for automatic point calculation
CREATE OR REPLACE FUNCTION public.calculate_customer_points(order_value numeric)
RETURNS integer AS $$
BEGIN
  -- Simple 10 points per order (regardless of order value)
  RETURN 10;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.calculate_representative_points(order_value numeric)
RETURNS integer AS $$
BEGIN
  -- Simple 10 points per order (regardless of order value)
  RETURN 10;
END;
$$ LANGUAGE plpgsql;

-- Create function to award points when order is completed
CREATE OR REPLACE FUNCTION public.award_loyalty_points_on_order_completion()
RETURNS TRIGGER AS $$
DECLARE
  customer_points integer := 10;  -- Fixed 10 points per order
  representative_points integer := 10;  -- Fixed 10 points per order
BEGIN
  -- Only process when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- Award 10 points to customer
    INSERT INTO public.customer_loyalty_points (customer_id, points, total_earned)
    VALUES (NEW.customer_id, customer_points, customer_points)
    ON CONFLICT (customer_id) DO UPDATE SET
      points = customer_loyalty_points.points + customer_points,
      total_earned = customer_loyalty_points.total_earned + customer_points,
      last_activity_date = now(),
      updated_at = now();
    
    -- Record customer transaction
    INSERT INTO public.customer_loyalty_transactions (customer_id, order_id, transaction_type, points, description)
    VALUES (NEW.customer_id, NEW.id, 'earned', customer_points, 'Points earned for completed order: ' || NEW.task_id);
    
    -- Award 10 points to representative (if assigned)
    IF NEW.representative_id IS NOT NULL THEN
      INSERT INTO public.representative_loyalty_points (representative_id, points, total_earned)
      VALUES (NEW.representative_id, representative_points, representative_points)
      ON CONFLICT (representative_id) DO UPDATE SET
        points = representative_loyalty_points.points + representative_points,
        total_earned = representative_loyalty_points.total_earned + representative_points,
        last_activity_date = now(),
        updated_at = now();
      
      -- Record representative transaction
      INSERT INTO public.representative_loyalty_transactions (representative_id, order_id, transaction_type, points, description)
      VALUES (NEW.representative_id, NEW.id, 'earned', representative_points, 'Points earned for completed order: ' || NEW.task_id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on delivery_tasks table
DROP TRIGGER IF EXISTS trigger_award_loyalty_points ON public.delivery_tasks;
CREATE TRIGGER trigger_award_loyalty_points
  AFTER UPDATE ON public.delivery_tasks
  FOR EACH ROW EXECUTE FUNCTION public.award_loyalty_points_on_order_completion();

-- Create views for easy querying
CREATE OR REPLACE VIEW public.customer_loyalty_summary AS
SELECT 
  c.id as customer_id,
  c.customer_id as customer_code,
  c.name as customer_name,
  c.email,
  c.phone,
  clp.points as current_points,
  clp.total_earned,
  clp.total_redeemed,
  clp.last_activity_date,
  CASE 
    WHEN clp.points >= 100 THEN 'Gold'
    WHEN clp.points >= 50 THEN 'Silver'
    WHEN clp.points >= 10 THEN 'Bronze'
    ELSE 'New'
  END as loyalty_tier
FROM public.customers c
LEFT JOIN public.customer_loyalty_points clp ON c.id = clp.customer_id;

CREATE OR REPLACE VIEW public.representative_loyalty_summary AS
SELECT 
  r.id as representative_id,
  r.name as representative_name,
  r.email,
  r.phone,
  rlp.points as current_points,
  rlp.total_earned,
  rlp.total_redeemed,
  rlp.last_activity_date,
  CASE 
    WHEN rlp.points >= 200 THEN 'Platinum'
    WHEN rlp.points >= 100 THEN 'Gold'
    WHEN rlp.points >= 50 THEN 'Silver'
    WHEN rlp.points >= 10 THEN 'Bronze'
    ELSE 'New'
  END as loyalty_tier
FROM public.representatives r
LEFT JOIN public.representative_loyalty_points rlp ON r.id = rlp.representative_id;

-- Create function to get loyalty leaderboard
CREATE OR REPLACE FUNCTION public.get_customer_loyalty_leaderboard(limit_count integer DEFAULT 10)
RETURNS TABLE (
  customer_id uuid,
  customer_name text,
  current_points integer,
  total_earned integer,
  loyalty_tier text,
  rank_position bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cls.customer_id,
    cls.customer_name,
    cls.current_points,
    cls.total_earned,
    cls.loyalty_tier,
    ROW_NUMBER() OVER (ORDER BY cls.current_points DESC) as rank_position
  FROM public.customer_loyalty_summary cls
  WHERE cls.current_points > 0
  ORDER BY cls.current_points DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.get_representative_loyalty_leaderboard(limit_count integer DEFAULT 10)
RETURNS TABLE (
  representative_id text,
  representative_name text,
  current_points integer,
  total_earned integer,
  loyalty_tier text,
  rank_position bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rls.representative_id,
    rls.representative_name,
    rls.current_points,
    rls.total_earned,
    rls.loyalty_tier,
    ROW_NUMBER() OVER (ORDER BY rls.current_points DESC) as rank_position
  FROM public.representative_loyalty_summary rls
  WHERE rls.current_points > 0
  ORDER BY rls.current_points DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data for testing
INSERT INTO public.customer_loyalty_points (customer_id, points, total_earned)
SELECT id, 0, 0 FROM public.customers
ON CONFLICT (customer_id) DO NOTHING;

INSERT INTO public.representative_loyalty_points (representative_id, points, total_earned)
SELECT id, 0, 0 FROM public.representatives
ON CONFLICT (representative_id) DO NOTHING;

-- Success message
SELECT 'Simple Loyalty System created successfully!' as message;
