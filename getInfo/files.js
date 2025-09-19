const express = require("express");
const mysql = require("mysql2/promise");
const router = express.Router();

// Connexion MySQL
const pool = mysql.createPool({
  host: "localhost",
  user: "root", // ⚡ change si besoin
  password: "", // ⚡ ton mot de passe
  database: "IDE", // ⚡ ta base MySQL
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

router.use(express.json());

/******************** GET FILES BY USER ********************/
router.post("/", async (req, res) => {
  try {
    const { user } = req.body;
    const [rows] = await pool.query(
      "SELECT * FROM file NATURAL JOIN users WHERE email = ? ORDER BY file_id",
      [user]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

/******************** DELETE FILE ********************/
router.delete("/:fileId", async (req, res) => {
  const fileId = req.params.fileId;
  try {
    await pool.query("DELETE FROM file WHERE file_id = ?", [fileId]);
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

/******************** UPDATE FILE NAME ********************/
router.put("/:fileId", async (req, res) => {
  const fileId = req.params.fileId;
  const { fileName, user } = req.body;
  try {
    // vérifier si un fichier existe déjà avec ce nom pour cet utilisateur
    const [checkfile] = await pool.query(
      "SELECT file_id FROM file WHERE filename = ? AND email = ?",
      [fileName, user]
    );
    if (checkfile.length) return res.sendStatus(409);

    await pool.query("UPDATE file SET filename = ? WHERE file_id = ?", [
      fileName,
      fileId,
    ]);
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
});

/******************** CREATE FILE ********************/
router.post("/create", async (req, res) => {
  const { fileName, user, content } = req.body;
  try {
    // vérifier si un fichier existe déjà avec ce nom pour cet utilisateur
    const [checkfile] = await pool.query(
      "SELECT file_id FROM file WHERE filename = ? AND email = ?",
      [fileName, user]
    );
    if (checkfile.length) return res.sendStatus(409);

    await pool.query(
      "INSERT INTO file (filename, email, content) VALUES (?, ?, ?)",
      [fileName, user, content]
    );
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
});

/******************** SEARCH FILES ********************/
router.get("/search", async (req, res) => {
  const searchTerm = req.query.search;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM file WHERE filename LIKE ?",
      [`%${searchTerm}%`]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

/******************** SAVE FILE CONTENT ********************/
router.post("/save", async (req, res) => {
  const { fileName, content, user } = req.body;
  try {
    await pool.query(
      "UPDATE file SET content = ? WHERE filename = ? AND email = ?",
      [content, fileName, user]
    );
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
});

module.exports = router;
