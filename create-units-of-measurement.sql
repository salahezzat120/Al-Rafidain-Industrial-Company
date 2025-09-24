-- Create units_of_measurement table if it does not exist
-- This schema supports both simple and bilingual setups

CREATE TABLE IF NOT EXISTS public.units_of_measurement (
    id SERIAL PRIMARY KEY,
    unit_name TEXT NOT NULL UNIQUE,
    unit_code TEXT UNIQUE,
    -- Alternative naming used in some projects
    unit_symbol TEXT UNIQUE,
    unit_name_ar TEXT,
    unit_symbol_ar TEXT,
    unit_type TEXT DEFAULT 'COUNT',
    conversion_factor NUMERIC(18,6) DEFAULT 1,
    base_unit_id INTEGER REFERENCES public.units_of_measurement(id) ON DELETE SET NULL,
    is_user_defined BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE public.units_of_measurement IS 'Measurement units master table';
COMMENT ON COLUMN public.units_of_measurement.unit_name IS 'English name of the unit';
COMMENT ON COLUMN public.units_of_measurement.unit_code IS 'Short code for the unit (e.g., KG, L, PCS)';
COMMENT ON COLUMN public.units_of_measurement.unit_symbol IS 'Alias for unit_code used by some schemas';

-- Helpful index for lookups by name/code/symbol
CREATE INDEX IF NOT EXISTS idx_units_name ON public.units_of_measurement (unit_name);
CREATE INDEX IF NOT EXISTS idx_units_code ON public.units_of_measurement (unit_code);
CREATE INDEX IF NOT EXISTS idx_units_symbol ON public.units_of_measurement (unit_symbol);

-- Seed a few common units if table is empty
INSERT INTO public.units_of_measurement (unit_name, unit_code, unit_symbol, unit_type, is_user_defined)
SELECT v.unit_name, v.unit_code, v.unit_symbol, v.unit_type, FALSE
FROM (
    VALUES
        ('Piece', 'PCS', 'PCS', 'COUNT'),
        ('Kilogram', 'KG', 'KG', 'WEIGHT'),
        ('Gram', 'G', 'G', 'WEIGHT'),
        ('Liter', 'L', 'L', 'VOLUME'),
        ('Milliliter', 'ML', 'ML', 'VOLUME'),
        ('Meter', 'M', 'M', 'LENGTH'),
        ('Centimeter', 'CM', 'CM', 'LENGTH'),
        ('Box', 'BOX', 'BOX', 'COUNT'),
        ('Pack', 'PACK', 'PACK', 'COUNT')
) AS v(unit_name, unit_code, unit_symbol, unit_type)
WHERE NOT EXISTS (
    SELECT 1 FROM public.units_of_measurement u
);


