-- Simple products table creation
-- Run this if you want a basic setup without all the extras

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    product_name_ar VARCHAR(255),
    product_code VARCHAR(100),
    main_group VARCHAR(100) NOT NULL,
    sub_group VARCHAR(100),
    color VARCHAR(50),
    material VARCHAR(50),
    unit VARCHAR(20) NOT NULL,
    description TEXT,
    cost_price DECIMAL(10,2) DEFAULT 0,
    selling_price DECIMAL(10,2) DEFAULT 0,
    weight DECIMAL(8,2),
    dimensions VARCHAR(100),
    expiry_date DATE,
    serial_number VARCHAR(100),
    warehouses TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Basic indexes
CREATE INDEX IF NOT EXISTS idx_products_name ON products(product_name);
CREATE INDEX IF NOT EXISTS idx_products_code ON products(product_code);
CREATE INDEX IF NOT EXISTS idx_products_main_group ON products(main_group);
