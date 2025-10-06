-- Vehicle Fleet Management Database Schema
-- This file contains the complete database schema for the vehicle fleet management system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id VARCHAR(50) UNIQUE NOT NULL,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    engine_type VARCHAR(50),
    fuel_type VARCHAR(50),
    capacity_kg INTEGER,
    fuel_capacity_l INTEGER,
    status VARCHAR(20) DEFAULT 'active',
    fuel_level_percent INTEGER DEFAULT 0,
    mileage_km INTEGER DEFAULT 0,
    current_location TEXT,
    insurance_company VARCHAR(100),
    purchase_price DECIMAL(12,2),
    service_interval_km INTEGER DEFAULT 10000,
    speed_limit_kmh INTEGER DEFAULT 80,
    color VARCHAR(50),
    fuel_consumption DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    license_number VARCHAR(50) UNIQUE NOT NULL,
    license_type VARCHAR(20) NOT NULL,
    license_expiry DATE,
    status VARCHAR(20) DEFAULT 'active',
    hire_date DATE,
    salary DECIMAL(10,2),
    address TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vehicle maintenance table
CREATE TABLE IF NOT EXISTS vehicle_maintenance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(50) NOT NULL,
    description TEXT,
    maintenance_date DATE NOT NULL,
    next_maintenance_date DATE,
    cost DECIMAL(10,2),
    mileage_at_maintenance INTEGER,
    service_provider VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fuel records table
CREATE TABLE IF NOT EXISTS fuel_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    fuel_date DATE NOT NULL,
    fuel_amount_l DECIMAL(8,2) NOT NULL,
    fuel_cost DECIMAL(10,2) NOT NULL,
    fuel_station VARCHAR(100),
    odometer_reading INTEGER,
    fuel_type VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vehicle assignments table
CREATE TABLE IF NOT EXISTS vehicle_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    assignment_date DATE NOT NULL,
    return_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vehicle tracking table
CREATE TABLE IF NOT EXISTS vehicle_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    speed_kmh INTEGER,
    heading_degrees INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    location_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vehicles_vehicle_id ON vehicles(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_license_plate ON vehicles(license_plate);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_vehicle_type ON vehicles(vehicle_type);

CREATE INDEX IF NOT EXISTS idx_drivers_driver_id ON drivers(driver_id);
CREATE INDEX IF NOT EXISTS idx_drivers_license_number ON drivers(license_number);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);

CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle_id ON vehicle_maintenance(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_date ON vehicle_maintenance(maintenance_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_type ON vehicle_maintenance(maintenance_type);

CREATE INDEX IF NOT EXISTS idx_fuel_vehicle_id ON fuel_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fuel_date ON fuel_records(fuel_date);

CREATE INDEX IF NOT EXISTS idx_assignments_vehicle_id ON vehicle_assignments(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_assignments_driver_id ON vehicle_assignments(driver_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON vehicle_assignments(status);

CREATE INDEX IF NOT EXISTS idx_tracking_vehicle_id ON vehicle_tracking(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_tracking_timestamp ON vehicle_tracking(timestamp);

-- Insert sample data
INSERT INTO vehicles (vehicle_id, license_plate, make, model, year, vehicle_type, engine_type, fuel_type, capacity_kg, fuel_capacity_l, status, fuel_level_percent, mileage_km, current_location, insurance_company, purchase_price, service_interval_km, speed_limit_kmh, color, fuel_consumption) VALUES
('ABC-123', 'ABC-123', 'Ford', 'Transit', 2022, 'Truck', 'Diesel', 'Diesel', 1500, 80, 'active', 85, 25000, 'Downtown Hub', 'Insurance Co.', 45000.00, 10000, 80, 'White', 8.5),
('XYZ-789', 'XYZ-789', 'Mercedes', 'Sprinter', 2021, 'Van', 'Diesel', 'Diesel', 1200, 70, 'maintenance', 45, 18000, 'Service Center', 'Insurance Co.', 55000.00, 10000, 80, 'Blue', 7.2),
('DEF-456', 'DEF-456', 'Honda', 'CB500', 2023, 'Motorcycle', 'Gasoline', 'Gasoline', 200, 15, 'active', 92, 5000, 'North Zone', 'Insurance Co.', 8000.00, 5000, 60, 'Red', 4.5);

INSERT INTO drivers (driver_id, first_name, last_name, email, phone, license_number, license_type, license_expiry, status, hire_date, salary, address, emergency_contact_name, emergency_contact_phone) VALUES
('DRV-001', 'Ahmed', 'Hassan', 'ahmed.hassan@company.com', '+966501234567', 'LIC-001', 'Commercial', '2025-12-31', 'active', '2023-01-15', 5000.00, 'Riyadh, Saudi Arabia', 'Fatima Hassan', '+966501234568'),
('DRV-002', 'Mohammed', 'Ali', 'mohammed.ali@company.com', '+966501234569', 'LIC-002', 'Commercial', '2025-11-30', 'active', '2023-02-01', 4800.00, 'Jeddah, Saudi Arabia', 'Aisha Ali', '+966501234570'),
('DRV-003', 'Omar', 'Khalil', 'omar.khalil@company.com', '+966501234571', 'LIC-003', 'Commercial', '2025-10-15', 'active', '2023-03-10', 5200.00, 'Dammam, Saudi Arabia', 'Layla Khalil', '+966501234572');

INSERT INTO vehicle_maintenance (vehicle_id, maintenance_type, description, maintenance_date, next_maintenance_date, cost, mileage_at_maintenance, service_provider, notes) VALUES
((SELECT id FROM vehicles WHERE vehicle_id = 'ABC-123'), 'Oil Change', 'Regular oil change and filter replacement', '2024-01-15', '2024-04-15', 150.00, 24000, 'Auto Service Center', 'Completed successfully'),
((SELECT id FROM vehicles WHERE vehicle_id = 'XYZ-789'), 'Brake Service', 'Brake pad replacement and brake fluid change', '2024-01-20', '2024-04-20', 300.00, 17500, 'Brake Specialists', 'Front brakes replaced'),
((SELECT id FROM vehicles WHERE vehicle_id = 'DEF-456'), 'Tire Rotation', 'Tire rotation and alignment check', '2024-01-10', '2024-04-10', 80.00, 4800, 'Tire Center', 'All tires in good condition');

INSERT INTO fuel_records (vehicle_id, fuel_date, fuel_amount_l, fuel_cost, fuel_station, odometer_reading, fuel_type, notes) VALUES
((SELECT id FROM vehicles WHERE vehicle_id = 'ABC-123'), '2024-01-20', 60.0, 180.00, 'Shell Station', 25000, 'Diesel', 'Full tank refill'),
((SELECT id FROM vehicles WHERE vehicle_id = 'XYZ-789'), '2024-01-18', 50.0, 150.00, 'Aramco Station', 18000, 'Diesel', 'Partial refill'),
((SELECT id FROM vehicles WHERE vehicle_id = 'DEF-456'), '2024-01-22', 12.0, 36.00, 'Petromin Station', 5000, 'Gasoline', 'Full tank refill');

INSERT INTO vehicle_assignments (vehicle_id, driver_id, assignment_date, status, notes) VALUES
((SELECT id FROM vehicles WHERE vehicle_id = 'ABC-123'), (SELECT id FROM drivers WHERE driver_id = 'DRV-001'), '2024-01-01', 'active', 'Assigned for delivery routes'),
((SELECT id FROM vehicles WHERE vehicle_id = 'XYZ-789'), (SELECT id FROM drivers WHERE driver_id = 'DRV-002'), '2024-01-01', 'active', 'Assigned for service calls'),
((SELECT id FROM vehicles WHERE vehicle_id = 'DEF-456'), (SELECT id FROM drivers WHERE driver_id = 'DRV-003'), '2024-01-01', 'active', 'Assigned for quick deliveries');

INSERT INTO vehicle_tracking (vehicle_id, latitude, longitude, speed_kmh, heading_degrees, location_name) VALUES
((SELECT id FROM vehicles WHERE vehicle_id = 'ABC-123'), 24.7136, 46.6753, 45, 90, 'Downtown Riyadh'),
((SELECT id FROM vehicles WHERE vehicle_id = 'XYZ-789'), 21.4858, 39.1925, 0, 0, 'Service Center Jeddah'),
((SELECT id FROM vehicles WHERE vehicle_id = 'DEF-456'), 26.4207, 50.0888, 35, 180, 'North Zone Dammam');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_updated_at BEFORE UPDATE ON vehicle_maintenance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fuel_updated_at BEFORE UPDATE ON fuel_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON vehicle_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tracking_updated_at BEFORE UPDATE ON vehicle_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();