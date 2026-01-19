const express = require("express");
const router = express.Router();
const pool = require("../db");

// Get files by user_id
router.get("/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM files WHERE user_id = ? ORDER BY file_id",
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

router.post("/", async (req, res) => {
  const { user_id, filename, content, exercise_id } = req.body;

  try {
    const [existing] = await pool.query(
      "SELECT * FROM files WHERE user_id = ? AND filename = ?",
      [user_id, filename]
    );
    if (existing.length) return res.sendStatus(409);

    await pool.query(
      "INSERT INTO files (user_id, filename, content, exercise_id, created_at) VALUES (?, ?, ?, ?, NOW())",
      [user_id, filename, content, exercise_id] // ← ici
    );

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

// Update file
router.put("/:fileId", async (req, res) => {
  const { fileId } = req.params;
  const { filename, content } = req.body;
  try {
    await pool.query(
      "UPDATE files SET filename = ?, content = ? WHERE file_id = ?",
      [filename, content, fileId]
    );
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

// Delete file
router.delete("/:fileId", async (req, res) => {
  const { fileId } = req.params;
  try {
    await pool.query("DELETE FROM files WHERE file_id = ?", [fileId]);
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

// Search files
router.get("/search/:userId", async (req, res) => {
  const { userId } = req.params;
  const searchTerm = req.query.q || "";
  try {
    const [rows] = await pool.query(
      "SELECT * FROM files WHERE user_id = ? AND filename LIKE ?",
      [userId, `%${searchTerm}%`]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
