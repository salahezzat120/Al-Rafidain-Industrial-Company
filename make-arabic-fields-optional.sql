-- Make Arabic fields optional to avoid null constraint errors
-- Run this in Supabase SQL Editor if you still get null constraint errors

-- Make movement_type_ar nullable
ALTER TABLE stock_movements ALTER COLUMN movement_type_ar DROP NOT NULL;

-- Make reference_number_ar nullable  
ALTER TABLE stock_movements ALTER COLUMN reference_number_ar DROP NOT NULL;

-- Make notes_ar nullable
ALTER TABLE stock_movements ALTER COLUMN notes_ar DROP NOT NULL;

-- Make created_by_ar nullable
ALTER TABLE stock_movements ALTER COLUMN created_by_ar DROP NOT NULL;

-- Set default values for existing records
UPDATE stock_movements 
SET movement_type_ar = CASE 
    WHEN movement_type = 'IN' THEN 'دخول'
    WHEN movement_type = 'OUT' THEN 'خروج'
    WHEN movement_type = 'TRANSFER' THEN 'نقل'
    WHEN movement_type = 'ADJUSTMENT' THEN 'تعديل'
    ELSE movement_type
END
WHERE movement_type_ar IS NULL;

UPDATE stock_movements 
SET reference_number_ar = reference_number
WHERE reference_number_ar IS NULL;

UPDATE stock_movements 
SET notes_ar = notes
WHERE notes_ar IS NULL;

UPDATE stock_movements 
SET created_by_ar = created_by
WHERE created_by_ar IS NULL;

SELECT 'Arabic fields made optional!' as status;
