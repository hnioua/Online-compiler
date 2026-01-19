const express = require("express");
const router = express.Router();
const pool = require("../db");

// Add a level history record
router.post("/", async (req, res) => {
  const { user_id, level, skill_score } = req.body;
  try {
    await pool.query(
      "INSERT INTO level_history (user_id, level, skill_score, changed_at) VALUES (?, ?, ?, NOW())",
      [user_id, level, skill_score]
    );
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

// Get all level history for a user
router.get("/user/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM level_history WHERE user_id = ? ORDER BY changed_at DESC",
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
