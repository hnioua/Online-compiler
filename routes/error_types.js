const express = require("express");
const router = express.Router();
const pool = require("../db");

// Get all error types
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM error_types");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

// Create a new error type
router.post("/", async (req, res) => {
  const { name, description } = req.body;
  try {
    await pool.query(
      "INSERT INTO error_types (name, description) VALUES (?, ?)",
      [name, description]
    );
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
