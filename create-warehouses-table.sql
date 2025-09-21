CREATE TABLE Warehouses (
    id SERIAL PRIMARY KEY,
    warehouse_name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    responsible_person VARCHAR(255) NOT NULL
);
