CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  plu VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE shops (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE stocks (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id),
  shop_id INT REFERENCES shops(id),
  on_shelf INT DEFAULT 0,
  in_order INT DEFAULT 0
);
