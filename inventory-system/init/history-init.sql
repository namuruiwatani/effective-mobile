CREATE TABLE actions_log (
  id SERIAL PRIMARY KEY,
  action_type VARCHAR(50) NOT NULL,
  product_id INT,
  shop_id INT,
  plu VARCHAR(50),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  details JSONB
);

CREATE INDEX idx_shop_id ON actions_log(shop_id);
CREATE INDEX idx_product_id ON actions_log(product_id);
CREATE INDEX idx_plu ON actions_log(plu);
CREATE INDEX idx_action_type ON actions_log(action_type);
CREATE INDEX idx_timestamp ON actions_log(timestamp);
