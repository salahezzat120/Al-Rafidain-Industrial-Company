-- Bring existing units_of_measurement table up to expected shape

-- Core columns
ALTER TABLE public.units_of_measurement
  ADD COLUMN IF NOT EXISTS unit_code TEXT,
  ADD COLUMN IF NOT EXISTS unit_symbol TEXT,
  ADD COLUMN IF NOT EXISTS unit_name_ar TEXT,
  ADD COLUMN IF NOT EXISTS unit_symbol_ar TEXT,
  ADD COLUMN IF NOT EXISTS unit_type TEXT DEFAULT 'COUNT',
  ADD COLUMN IF NOT EXISTS conversion_factor NUMERIC(18,6) DEFAULT 1,
  ADD COLUMN IF NOT EXISTS base_unit_id INTEGER,
  ADD COLUMN IF NOT EXISTS is_user_defined BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Self reference FK (safe if already present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE c.conname = 'units_of_measurement_base_unit_id_fkey'
      AND t.relname = 'units_of_measurement'
  ) THEN
    ALTER TABLE public.units_of_measurement
      ADD CONSTRAINT units_of_measurement_base_unit_id_fkey
      FOREIGN KEY (base_unit_id) REFERENCES public.units_of_measurement(id) ON DELETE SET NULL;
  END IF;
END$$;

-- Helpful indexes (safe idempotent)
CREATE INDEX IF NOT EXISTS idx_units_name ON public.units_of_measurement (unit_name);
CREATE INDEX IF NOT EXISTS idx_units_code ON public.units_of_measurement (unit_code);
CREATE INDEX IF NOT EXISTS idx_units_symbol ON public.units_of_measurement (unit_symbol);

-- Optional: keep unit_name unique when possible
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'units_of_measurement_unit_name_key'
  ) THEN
    BEGIN
      ALTER TABLE public.units_of_measurement
        ADD CONSTRAINT units_of_measurement_unit_name_key UNIQUE (unit_name);
    EXCEPTION WHEN others THEN
      -- Skip if duplicates exist; constraint can be added later after deduplication
      NULL;
    END;
  END IF;
END$$;


