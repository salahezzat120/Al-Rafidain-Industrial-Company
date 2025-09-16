-- Loyalty System Schema
-- Run in Supabase SQL Editor (Development: permissive RLS)

CREATE TABLE IF NOT EXISTS public.loyalty_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  -- Period key (month-level for incentives)
  period_month date NOT NULL, -- use the first day of month (e.g., 2025-09-01)
  visits_count integer NOT NULL DEFAULT 0 CHECK (visits_count >= 0),
  deal_closing_rate numeric(5,2) NOT NULL DEFAULT 0 CHECK (deal_closing_rate >= 0 AND deal_closing_rate <= 100),
  punctuality_score numeric(3,2) NOT NULL DEFAULT 0 CHECK (punctuality_score >= 0 AND punctuality_score <= 5),
  customer_satisfaction numeric(3,2) NOT NULL DEFAULT 0 CHECK (customer_satisfaction >= 0 AND customer_satisfaction <= 5),
  comments text,
  total_points integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (employee_id, period_month)
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER update_loyalty_evaluations_updated_at
BEFORE UPDATE ON public.loyalty_evaluations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.loyalty_evaluations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on loyalty_evaluations" ON public.loyalty_evaluations FOR ALL USING (true);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_loyalty_employee_period ON public.loyalty_evaluations(employee_id, period_month);
CREATE INDEX IF NOT EXISTS idx_loyalty_period ON public.loyalty_evaluations(period_month);

-- View: loyalty_leaderboard_monthly (aggregated points per month)
CREATE OR REPLACE VIEW public.loyalty_leaderboard_monthly AS
SELECT 
  period_month,
  employee_id,
  SUM(total_points) AS points,
  AVG(deal_closing_rate) AS avg_closing_rate,
  AVG(punctuality_score) AS avg_punctuality,
  AVG(customer_satisfaction) AS avg_csat,
  SUM(visits_count) AS total_visits
FROM public.loyalty_evaluations
GROUP BY period_month, employee_id;


