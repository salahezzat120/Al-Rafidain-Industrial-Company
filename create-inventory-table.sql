CREATE TABLE Inventory (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    warehouse_id INT NOT NULL,
    available_quantity INT NOT NULL,
    minimum_stock_level INT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES Products(id),
    FOREIGN KEY (warehouse_id) REFERENCES Warehouses(id)
);
