const express = require("express");
const router = express.Router();
const pool = require("../db");

// Signup
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    await pool.query(
      "INSERT INTO users (username, email, password, current_level, skill_score, created_at) VALUES (?, ?, ?, 'N1', 0, NOW())",
      [username, email, password]
    );
    res.status(200).send("User created successfully");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

/******************** LOGIN ********************/
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Récupérer email, level et score
    const [rows] = await pool.query(
      "SELECT user_id, email, current_level, skill_score FROM users WHERE email = ? AND password = ?",
      [email, password]
    );

    if (rows.length > 0) {
      // Renvoyer les infos au frontend
      res.status(200).json({
        status: "ok",
        email: rows[0].email,
        current_level: rows[0].current_level,
        skill_score: rows[0].skill_score,
        user_id: rows[0].user_id,
      });
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    console.error(error);
    res.status(501).json({ status: "error", message: error.message });
  }
});

// Update user
router.put("/update", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    await pool.query(
      "UPDATE users SET username = ?, password = ? WHERE email = ?",
      [username, password, email]
    );
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

// Get user by email
router.get("/:email", async (req, res) => {
  const email = req.params.email;
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length > 0) res.json(rows[0]);
    else res.status(404).json({ error: "User not found" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
