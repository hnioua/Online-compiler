const express = require("express");
const router = express.Router();
const pool = require("../db");

// Create a new exercise attempt
router.post("/", async (req, res) => {
  const { user_id, exercise_id, success, score, time_spent, attempts_count } =
    req.body;
  try {
    await pool.query(
      "INSERT INTO exercise_attempts (user_id, exercise_id, success, score, time_spent, attempts_count, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
      [user_id, exercise_id, success, score, time_spent, attempts_count]
    );
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

// Get all attempts by user
router.get("/user/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM exercise_attempts WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
