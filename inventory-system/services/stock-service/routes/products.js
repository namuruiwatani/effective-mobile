const express = require("express");
const router = express.Router();
const axios = require("axios");
const db = require("../db");

const BASE_URL = "http://host.docker.internal:3002";

const logAction = async (action_type, product_id, shop_id, plu, details) => {
  console.log("logAction called with params:", {
    action_type,
    product_id,
    shop_id,
    plu,
    details,
  });

  try {
    const payload = { action_type, product_id, shop_id, plu, details };

    const response = await axios.post(`${BASE_URL}/actions`, payload);
  } catch (error) {
    if (error.response) {
      console.error("HTTP error response:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      console.error("No response received for request:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
    console.error("Failed to log action via HTTP:", error);
  }
};

router.post("/", async (req, res) => {
  const { plu, name } = req.body;
  if (!plu || !name) {
    return res.status(400).json({ error: "PLU and name are required." });
  }

  try {
    const result = await db.query(
      "INSERT INTO products (plu, name) VALUES ($1, $2) RETURNING id",
      [plu, name]
    );

    const productId = result.rows[0].id;

    await logAction("create_product", productId, null, plu, { name });

    res
      .status(201)
      .json({ message: "Product created successfully", id: productId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create product" });
  }
});

router.get("/", async (req, res) => {
  const { plu, name } = req.query;
  const filters = [];
  const params = [];

  if (plu) {
    filters.push("plu = $" + (params.length + 1));
    params.push(plu);
  }

  if (name) {
    filters.push("name ILIKE $" + (params.length + 1));
    params.push(`%${name}%`);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  try {
    const result = await db.query(
      `SELECT * FROM products ${whereClause}`,
      params
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

module.exports = router;
