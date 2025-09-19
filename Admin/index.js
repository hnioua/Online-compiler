const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");

// Connexion MySQL
const pool = mysql.createPool({
  host: "localhost",
  user: "root", // ⚡ change si nécessaire
  password: "", // ⚡ mets ton mot de passe
  database: "IDE", // ⚡ nom de ta base
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

router.use(express.json());

/******************** ADMIN - GET USERS ********************/
router.get("/admin", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users");
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/******************** CREATE USER ********************/
router.post("/create", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    await pool.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, password]
    );
    res.status(200).send("ok");
  } catch (error) {
    console.log(error);
    res.status(501).send(error.message);
  }
});

/******************** DELETE USER ********************/
router.delete("/delete/:email", async (req, res) => {
  const email = req.params.email;
  try {
    await pool.query("DELETE FROM users WHERE email = ?", [email]);
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

/******************** DELETE FILE ********************/
router.delete("/deleteF/:fileId", async (req, res) => {
  const fileId = req.params.fileId;
  try {
    await pool.query("DELETE FROM file WHERE file_id = ?", [fileId]);
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

/******************** UPDATE USER ********************/
router.put("/update", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    await pool.query(
      "UPDATE users SET username = ?, email = ?, password = ? WHERE email = ?",
      [username, email, password, email]
    );
    res.status(200).json("Utilisateur mis à jour avec succès");
  } catch (error) {
    console.error(error);
    res.status(500).json("Erreur lors de la mise à jour de l'utilisateur");
  }
});

/******************** SEARCH USERS ********************/
router.get("/search", async (req, res) => {
  const searchQuery = req.query.query;
  try {
    const [rows] = await pool.query(
      `SELECT * FROM users
       WHERE username LIKE ?
       OR email LIKE ?
       OR password LIKE ?`,
      [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("An error occurred while searching for users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/******************** SEARCH FILES ********************/
router.get("/searchF", async (req, res) => {
  const searchQuery = req.query.query;
  try {
    const [rows] = await pool.query(
      `SELECT * FROM file WHERE filename LIKE ?`,
      [`%${searchQuery}%`]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("An error occurred while searching for files:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/******************** GET FILES BY USER ********************/
router.post("/file", async (req, res) => {
  try {
    const { user } = req.body;
    const [rows] = await pool.query(
      "SELECT * FROM file NATURAL JOIN users WHERE email = ?",
      [user]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

/******************** READ USER BY EMAIL ********************/
router.post("/read", async (req, res) => {
  try {
    const { email } = req.body;
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length > 0) {
      res.send({ rows });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the request" });
  }
});

/******************** READ FILE BY ID ********************/
router.post("/readF", async (req, res) => {
  try {
    const { file_id } = req.body;
    const [rows] = await pool.query("SELECT * FROM file WHERE file_id = ?", [
      file_id,
    ]);
    if (rows.length > 0) {
      res.send({ rows });
    } else {
      res.status(404).json({ error: "File not found" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the request" });
  }
});

/******************** UPDATE FILE ********************/
router.put("/updateF", async (req, res) => {
  const { email, filename, content, file_id } = req.body;
  try {
    await pool.query(
      "UPDATE file SET email = ?, filename = ?, content = ? WHERE file_id = ?",
      [email, filename, content, file_id]
    );
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
