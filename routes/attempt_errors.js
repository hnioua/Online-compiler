const express = require("express");
const router = express.Router();
const pool = require("../db");

// Add an error for an attempt
router.post("/", async (req, res) => {
  const { attempt_id, error_type_id, count } = req.body;
  try {
    await pool.query(
      "INSERT INTO attempt_errors (attempt_id, error_type_id, count) VALUES (?, ?, ?)",
      [attempt_id, error_type_id, count]
    );
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

// Get all errors for an attempt
router.get("/attempt/:attemptId", async (req, res) => {
  const attemptId = req.params.attemptId;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM attempt_errors WHERE attempt_id = ?",
      [attemptId]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
