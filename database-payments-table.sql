-- Payment Tracking System Database Schema
-- Run this in your Supabase SQL Editor

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  payment_id text NOT NULL,
  customer_id uuid NOT NULL,
  order_id text,
  amount numeric(10, 2) NOT NULL,
  due_amount numeric(10, 2) NOT NULL,
  paid_amount numeric(10, 2) DEFAULT 0.00,
  outstanding_balance numeric(10, 2) GENERATED ALWAYS AS (due_amount - paid_amount) STORED,
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'card', 'transfer', 'check', 'other')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue', 'cancelled')),
  due_date date NOT NULL,
  collection_date date,
  payment_reference text,
  notes text,
  created_by uuid,
  updated_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_payment_id_key UNIQUE (payment_id),
  CONSTRAINT payments_amount_positive CHECK (amount > 0),
  CONSTRAINT payments_due_amount_positive CHECK (due_amount > 0),
  CONSTRAINT payments_paid_amount_non_negative CHECK (paid_amount >= 0),
  CONSTRAINT payments_paid_not_exceed_due CHECK (paid_amount <= due_amount)
) TABLESPACE pg_default;

-- Create payment_installments table for tracking partial payments
CREATE TABLE IF NOT EXISTS public.payment_installments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL,
  installment_number integer NOT NULL,
  amount numeric(10, 2) NOT NULL,
  due_date date NOT NULL,
  paid_date date,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  payment_method text CHECK (payment_method IN ('cash', 'card', 'transfer', 'check', 'other')),
  reference text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payment_installments_pkey PRIMARY KEY (id),
  CONSTRAINT payment_installments_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE CASCADE,
  CONSTRAINT payment_installments_amount_positive CHECK (amount > 0)
) TABLESPACE pg_default;

-- Create payment_methods table for tracking payment method details
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL,
  method_type text NOT NULL CHECK (method_type IN ('cash', 'card', 'transfer', 'check', 'other')),
  method_details jsonb,
  transaction_id text,
  bank_name text,
  account_number text,
  card_last_four text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payment_methods_pkey PRIMARY KEY (id),
  CONSTRAINT payment_methods_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON public.payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON public.payments(due_date);
CREATE INDEX IF NOT EXISTS idx_payments_collection_date ON public.payments(collection_date);
CREATE INDEX IF NOT EXISTS idx_payments_payment_method ON public.payments(payment_method);
CREATE INDEX IF NOT EXISTS idx_payment_installments_payment_id ON public.payment_installments(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_installments_status ON public.payment_installments(status);
CREATE INDEX IF NOT EXISTS idx_payment_methods_payment_id ON public.payment_methods(payment_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payment_installments_updated_at BEFORE UPDATE ON public.payment_installments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for payments
CREATE POLICY "Allow all operations on payments" ON public.payments FOR ALL USING (true);
CREATE POLICY "Allow all operations on payment_installments" ON public.payment_installments FOR ALL USING (true);
CREATE POLICY "Allow all operations on payment_methods" ON public.payment_methods FOR ALL USING (true);

-- Create function to automatically update payment status based on paid amount
CREATE OR REPLACE FUNCTION public.update_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update payment status based on paid amount
    IF NEW.paid_amount = 0 THEN
        NEW.payment_status = 'pending';
    ELSIF NEW.paid_amount < NEW.due_amount THEN
        NEW.payment_status = 'partial';
    ELSIF NEW.paid_amount = NEW.due_amount THEN
        NEW.payment_status = 'paid';
        NEW.collection_date = COALESCE(NEW.collection_date, CURRENT_DATE);
    END IF;
    
    -- Check if payment is overdue
    IF NEW.due_date < CURRENT_DATE AND NEW.payment_status != 'paid' THEN
        NEW.payment_status = 'overdue';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update payment status
CREATE TRIGGER update_payment_status_trigger 
    BEFORE INSERT OR UPDATE ON public.payments 
    FOR EACH ROW EXECUTE FUNCTION public.update_payment_status();

-- Create function to generate payment ID
CREATE OR REPLACE FUNCTION public.generate_payment_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.payment_id IS NULL OR NEW.payment_id = '' THEN
        NEW.payment_id = 'PAY' || to_char(now(), 'YYYYMMDD') || '-' || lpad(nextval('payment_sequence')::text, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create sequence for payment ID generation
CREATE SEQUENCE IF NOT EXISTS payment_sequence START 1;

-- Create trigger to generate payment ID
CREATE TRIGGER generate_payment_id_trigger 
    BEFORE INSERT ON public.payments 
    FOR EACH ROW EXECUTE FUNCTION public.generate_payment_id();

-- Insert sample data for testing
INSERT INTO public.payments (customer_id, order_id, amount, due_amount, paid_amount, payment_method, due_date, payment_status, notes) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'ORD-001', 1500.00, 1500.00, 0.00, 'cash', CURRENT_DATE + INTERVAL '30 days', 'pending', 'Monthly service payment'),
('550e8400-e29b-41d4-a716-446655440001', 'ORD-002', 2500.00, 2500.00, 1250.00, 'transfer', CURRENT_DATE + INTERVAL '15 days', 'partial', 'Partial payment received'),
('550e8400-e29b-41d4-a716-446655440002', 'ORD-003', 800.00, 800.00, 800.00, 'card', CURRENT_DATE - INTERVAL '5 days', 'paid', 'Payment completed on time'),
('550e8400-e29b-41d4-a716-446655440003', 'ORD-004', 3000.00, 3000.00, 0.00, 'check', CURRENT_DATE - INTERVAL '10 days', 'overdue', 'Payment overdue');

-- Create view for payment analytics
CREATE OR REPLACE VIEW public.payment_analytics AS
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as total_payments,
    SUM(amount) as total_amount,
    SUM(paid_amount) as total_paid,
    SUM(outstanding_balance) as total_outstanding,
    COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_count,
    COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN payment_status = 'partial' THEN 1 END) as partial_count,
    COUNT(CASE WHEN payment_status = 'overdue' THEN 1 END) as overdue_count,
    AVG(CASE WHEN payment_status = 'paid' THEN (collection_date - due_date) END) as avg_days_to_pay
FROM public.payments
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Create view for customer payment summary
CREATE OR REPLACE VIEW public.customer_payment_summary AS
SELECT 
    customer_id,
    COUNT(*) as total_payments,
    SUM(amount) as total_amount,
    SUM(paid_amount) as total_paid,
    SUM(outstanding_balance) as total_outstanding,
    COUNT(CASE WHEN payment_status = 'overdue' THEN 1 END) as overdue_count,
    MAX(CASE WHEN payment_status = 'overdue' THEN due_date END) as oldest_overdue_date
FROM public.payments
GROUP BY customer_id;
