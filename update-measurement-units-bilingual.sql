-- Update Measurement Units for Full Arabic & English Support
-- This script enhances the existing units_of_measurement table with complete bilingual support

-- Step 1: Update existing units with Arabic translations
UPDATE units_of_measurement 
SET unit_name_ar = 'قطعة', unit_symbol_ar = 'قطعة'
WHERE unit_name = 'Piece' AND (unit_name_ar IS NULL OR unit_name_ar = '');

UPDATE units_of_measurement 
SET unit_name_ar = 'كيلوغرام', unit_symbol_ar = 'كغ'
WHERE unit_name = 'Kilogram' AND (unit_name_ar IS NULL OR unit_name_ar = '');

UPDATE units_of_measurement 
SET unit_name_ar = 'غرام', unit_symbol_ar = 'غ'
WHERE unit_name = 'Gram' AND (unit_name_ar IS NULL OR unit_name_ar = '');

UPDATE units_of_measurement 
SET unit_name_ar = 'لتر', unit_symbol_ar = 'ل'
WHERE unit_name = 'Liter' AND (unit_name_ar IS NULL OR unit_name_ar = '');

UPDATE units_of_measurement 
SET unit_name_ar = 'مليلتر', unit_symbol_ar = 'مل'
WHERE unit_name = 'Milliliter' AND (unit_name_ar IS NULL OR unit_name_ar = '');

UPDATE units_of_measurement 
SET unit_name_ar = 'متر', unit_symbol_ar = 'م'
WHERE unit_name = 'Meter' AND (unit_name_ar IS NULL OR unit_name_ar = '');

UPDATE units_of_measurement 
SET unit_name_ar = 'سنتيمتر', unit_symbol_ar = 'سم'
WHERE unit_name = 'Centimeter' AND (unit_name_ar IS NULL OR unit_name_ar = '');

UPDATE units_of_measurement 
SET unit_name_ar = 'صندوق', unit_symbol_ar = 'صندوق'
WHERE unit_name = 'Box' AND (unit_name_ar IS NULL OR unit_name_ar = '');

UPDATE units_of_measurement 
SET unit_name_ar = 'عبوة', unit_symbol_ar = 'عبوة'
WHERE unit_name = 'Pack' AND (unit_name_ar IS NULL OR unit_name_ar = '');

-- Step 2: Add more comprehensive measurement units with Arabic support
INSERT INTO units_of_measurement (
    unit_name, 
    unit_name_ar, 
    unit_code, 
    unit_symbol, 
    unit_symbol_ar, 
    unit_type, 
    is_user_defined
) VALUES
-- Weight Units
('Ton', 'طن', 'T', 'T', 'طن', 'WEIGHT', false),
('Pound', 'رطل', 'LB', 'LB', 'رطل', 'WEIGHT', false),
('Ounce', 'أونصة', 'OZ', 'OZ', 'أونصة', 'WEIGHT', false),

-- Volume Units  
('Cubic Meter', 'متر مكعب', 'M3', 'M³', 'م³', 'VOLUME', false),
('Cubic Centimeter', 'سنتيمتر مكعب', 'CM3', 'CM³', 'سم³', 'VOLUME', false),
('Gallon', 'غالون', 'GAL', 'GAL', 'غالون', 'VOLUME', false),

-- Length Units
('Kilometer', 'كيلومتر', 'KM', 'KM', 'كم', 'LENGTH', false),
('Millimeter', 'مليمتر', 'MM', 'MM', 'مم', 'LENGTH', false),
('Inch', 'بوصة', 'IN', 'IN', 'بوصة', 'LENGTH', false),
('Foot', 'قدم', 'FT', 'FT', 'قدم', 'LENGTH', false),

-- Area Units
('Square Kilometer', 'كيلومتر مربع', 'KM2', 'KM²', 'كم²', 'AREA', false),
('Square Centimeter', 'سنتيمتر مربع', 'CM2', 'CM²', 'سم²', 'AREA', false),
('Square Inch', 'بوصة مربعة', 'IN2', 'IN²', 'بوصة²', 'AREA', false),
('Square Foot', 'قدم مربع', 'FT2', 'FT²', 'قدم²', 'AREA', false),

-- Count Units
('Dozen', 'دزينة', 'DZ', 'DZ', 'دزينة', 'COUNT', false),
('Hundred', 'مئة', 'H', 'H', 'مئة', 'COUNT', false),
('Thousand', 'ألف', 'K', 'K', 'ألف', 'COUNT', false),
('Million', 'مليون', 'M', 'M', 'مليون', 'COUNT', false),

-- Time Units
('Hour', 'ساعة', 'HR', 'HR', 'ساعة', 'TIME', false),
('Day', 'يوم', 'DAY', 'DAY', 'يوم', 'TIME', false),
('Week', 'أسبوع', 'WK', 'WK', 'أسبوع', 'TIME', false),
('Month', 'شهر', 'MO', 'MO', 'شهر', 'TIME', false),
('Year', 'سنة', 'YR', 'YR', 'سنة', 'TIME', false)

ON CONFLICT (unit_code) DO NOTHING;

-- Step 3: Create a view for easy bilingual queries
CREATE OR REPLACE VIEW units_of_measurement_bilingual AS
SELECT 
    id,
    unit_name,
    unit_name_ar,
    unit_code,
    unit_symbol,
    unit_symbol_ar,
    unit_type,
    conversion_factor,
    base_unit_id,
    is_user_defined,
    created_at,
    -- Computed fields for display
    CASE 
        WHEN unit_name_ar IS NOT NULL AND unit_name_ar != '' 
        THEN unit_name_ar 
        ELSE unit_name 
    END as display_name_ar,
    unit_name as display_name_en
FROM units_of_measurement
ORDER BY unit_type, unit_name;

-- Step 4: Grant permissions for the view
GRANT SELECT ON units_of_measurement_bilingual TO authenticated;

-- Step 5: Create a function to get units by type with language support
CREATE OR REPLACE FUNCTION get_units_by_type_and_language(
    unit_type_filter TEXT DEFAULT NULL,
    language_code TEXT DEFAULT 'en'
)
RETURNS TABLE (
    id INTEGER,
    unit_name TEXT,
    unit_name_ar TEXT,
    unit_code TEXT,
    unit_symbol TEXT,
    unit_symbol_ar TEXT,
    unit_type TEXT,
    display_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.unit_name,
        u.unit_name_ar,
        u.unit_code,
        u.unit_symbol,
        u.unit_symbol_ar,
        u.unit_type,
        CASE 
            WHEN language_code = 'ar' AND u.unit_name_ar IS NOT NULL AND u.unit_name_ar != ''
            THEN u.unit_name_ar
            ELSE u.unit_name
        END as display_name
    FROM units_of_measurement u
    WHERE (unit_type_filter IS NULL OR u.unit_type = unit_type_filter)
    ORDER BY u.unit_type, u.unit_name;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_units_by_type_and_language(TEXT, TEXT) TO authenticated;

-- Step 7: Verify the bilingual setup
SELECT 'Measurement Units Bilingual Setup Complete' as status;

-- Show sample of bilingual units
SELECT 
    unit_name as 'English Name',
    unit_name_ar as 'Arabic Name',
    unit_code as 'Code',
    unit_symbol as 'Symbol',
    unit_symbol_ar as 'Arabic Symbol',
    unit_type as 'Type'
FROM units_of_measurement
WHERE unit_name_ar IS NOT NULL AND unit_name_ar != ''
ORDER BY unit_type, unit_name
LIMIT 10;

-- Step 8: Test the bilingual function
SELECT 'Testing Bilingual Function (English):' as test_name;
SELECT * FROM get_units_by_type_and_language('COUNT', 'en') LIMIT 5;

SELECT 'Testing Bilingual Function (Arabic):' as test_name;
SELECT * FROM get_units_by_type_and_language('COUNT', 'ar') LIMIT 5;
