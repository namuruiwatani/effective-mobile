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
  const { product_id, shop_id, on_shelf, in_order } = req.body;

  if (
    !product_id ||
    !shop_id ||
    on_shelf === undefined ||
    in_order === undefined
  ) {
    return res
      .status(400)
      .json({ error: "Product ID and Shop ID are required." });
  }

  try {
    const productResult = await db.query(
      "SELECT plu FROM products WHERE id = $1",
      [product_id]
    );
    if (productResult.rows.length === 0) {
      return res.status(400).json({ error: "Product not found" });
    }
    const plu = productResult.rows[0].plu;

    const shopResult = await db.query("SELECT id FROM shops WHERE id = $1", [
      shop_id,
    ]);
    if (shopResult.rows.length === 0) {
      return res.status(400).json({ error: "Shop not found" });
    }

    await db.query(
      "INSERT INTO stocks (product_id, shop_id, on_shelf, in_order) VALUES ($1, $2, $3, $4)",
      [product_id, shop_id, on_shelf || 0, in_order || 0]
    );

    await logAction("create_stock", product_id, shop_id, plu, {
      on_shelf,
      in_order,
    });

    res.status(201).json({ message: "Stock created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create stock" });
  }
});

router.patch("/increase/:id", async (req, res) => {
  const { id } = req.params;
  const { amount, type } = req.body;

  if (!amount || !type)
    return res.status(400).json({ error: "Amount and type are required." });

  if (!["on_shelf", "in_order"].includes(type)) {
    return res.status(400).json({
      error: "Invalid type. It must be either 'on_shelf' or 'in_order'.",
    });
  }

  try {
    const stock = await db.query(
      "SELECT product_id, shop_id FROM stocks WHERE id = $1",
      [id]
    );
    if (stock.rows.length === 0) {
      return res.status(404).json({ error: "Stock record not found." });
    }
    const { product_id, shop_id } = stock.rows[0];

    const productResult = await db.query(
      "SELECT plu FROM products WHERE id = $1",
      [product_id]
    );
    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: "Product not found." });
    }
    const plu = productResult.rows[0].plu;

    const updateQuery = `
        UPDATE stocks
        SET ${type} = ${type} + $1
        WHERE id = $2
      `;
    await db.query(updateQuery, [amount, id]);

    await logAction(
      type === "on_shelf"
        ? "increase_stock_on_shelf"
        : "increase_stock_in_order",
      product_id,
      shop_id,
      plu,
      { amount }
    );

    res.json({ message: `${type} increased successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to increase stock" });
  }
});

router.patch("/decrease/:id", async (req, res) => {
  const { id } = req.params;
  const { amount, type } = req.body;

  if (!amount || !type)
    return res.status(400).json({ error: "Amount and type are required." });

  if (!["on_shelf", "in_order"].includes(type)) {
    return res.status(400).json({
      error: "Invalid type. It must be either 'on_shelf' or 'in_order'.",
    });
  }

  try {
    const stock = await db.query(
      "SELECT product_id, shop_id FROM stocks WHERE id = $1",
      [id]
    );
    if (stock.rows.length === 0) {
      return res.status(404).json({ error: "Stock record not found." });
    }
    const { product_id, shop_id } = stock.rows[0];

    const productResult = await db.query(
      "SELECT plu FROM products WHERE id = $1",
      [product_id]
    );
    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: "Product not found." });
    }
    const plu = productResult.rows[0].plu;

    const updateQuery = `
        UPDATE stocks
        SET ${type} = ${type} - $1
        WHERE id = $2
      `;
    await db.query(updateQuery, [amount, id]);

    await logAction(
      type === "on_shelf"
        ? "decrease_stock_on_shelf"
        : "decrease_stock_in_order",
      product_id,
      shop_id,
      plu,
      { amount }
    );

    res.json({ message: `${type} decreased successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to decrease stock" });
  }
});

router.get("/", async (req, res) => {
  const {
    plu,
    shop_id,
    on_shelf_min,
    on_shelf_max,
    in_order_min,
    in_order_max,
  } = req.query;

  let query = `
      SELECT stocks.*, products.plu, shops.name as shop_name
      FROM stocks
      JOIN products ON stocks.product_id = products.id
      JOIN shops ON stocks.shop_id = shops.id
      WHERE 1=1`;
  let params = [];

  if (plu) {
    query += " AND products.plu ILIKE $" + (params.length + 1);
    params.push(`%${plu}%`);
  }

  if (shop_id) {
    query += " AND stocks.shop_id = $" + (params.length + 1);
    params.push(shop_id);
  }

  if (on_shelf_min) {
    query += " AND stocks.on_shelf >= $" + (params.length + 1);
    params.push(on_shelf_min);
  }

  if (on_shelf_max) {
    query += " AND stocks.on_shelf <= $" + (params.length + 1);
    params.push(on_shelf_max);
  }

  if (in_order_min) {
    query += " AND stocks.in_order >= $" + (params.length + 1);
    params.push(in_order_min);
  }

  if (in_order_max) {
    query += " AND stocks.in_order <= $" + (params.length + 1);
    params.push(in_order_max);
  }

  try {
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get stocks" });
  }
});

module.exports = router;
