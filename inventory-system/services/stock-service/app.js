const express = require("express");
const bodyParser = require("body-parser");
const productRoutes = require("./routes/products");
const stockRoutes = require("./routes/stocks");
const shopRoutes = require("./routes/shops");
const db = require("./db");

const app = express();
app.use(bodyParser.json());

app.use("/shop", shopRoutes);
app.use("/products", productRoutes);
app.use("/stocks", stockRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  await db.connect();
  console.log(`Stock Service running on port ${PORT}`);
});
