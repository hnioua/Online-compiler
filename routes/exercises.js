const express = require("express");
const router = express.Router();
const pool = require("../db");

// Get a random exercise
router.get("/random", async (req, res) => {
  try {
    // MySQL query pour récupérer un exercice aléatoire
    const [rows] = await pool.query(
      "SELECT * FROM exercises ORDER BY RAND() LIMIT 1"
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "No exercises found" });
    }

    res.json(rows[0]); // Renvoie le premier (et unique) exercice aléatoire
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

// Create exercise
router.post("/", async (req, res) => {
  const {
    title,
    topic,
    description,
    difficulty,
    estimated_time,
    complexity_score,
  } = req.body;
  try {
    await pool.query(
      "INSERT INTO exercises (title, topic, description, difficulty, estimated_time, complexity_score) VALUES (?, ?, ?, ?, ?, ?)",
      [title, topic, description, difficulty, estimated_time, complexity_score]
    );
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
