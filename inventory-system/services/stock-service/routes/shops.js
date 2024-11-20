const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/", async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Shop name is required." });
  }

  try {
    const result = await db.query(
      "INSERT INTO shops (name) VALUES ($1) RETURNING id, name",
      [name]
    );
    const newShop = result.rows[0];
    res.status(201).json(newShop);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create shop" });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM shops");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch shops" });
  }
});

module.exports = router;
