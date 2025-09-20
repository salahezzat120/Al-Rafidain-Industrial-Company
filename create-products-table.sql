CREATE TABLE Products (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    main_group VARCHAR(255) NOT NULL,
    sub_group VARCHAR(255),
    color VARCHAR(255),
    material VARCHAR(255),
    unit_of_measurement VARCHAR(255) NOT NULL
);
