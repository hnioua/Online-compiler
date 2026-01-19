const express = require("express");
const router = express.Router();
const pool = require("../db");

// Add a rating
router.post("/", async (req, res) => {
  const { user_id, exercise_id, rating, comment } = req.body;
  try {
    await pool.query(
      "INSERT INTO ratings (user_id, exercise_id, rating, comment, created_at) VALUES (?, ?, ?, ?, NOW())",
      [user_id, exercise_id, rating, comment]
    );
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

// Get all ratings for an exercise
router.get("/exercise/:exerciseId", async (req, res) => {
  const exerciseId = req.params.exerciseId;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM ratings WHERE exercise_id = ?",
      [exerciseId]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
