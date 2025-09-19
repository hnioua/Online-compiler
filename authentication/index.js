const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");

// Connexion MySQL
const pool = mysql.createPool({
  host: "localhost",
  user: "root", // ⚡ change si besoin
  password: "", // ⚡ mets ton mot de passe
  database: "IDE", // ⚡ ta base de données
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

router.use(express.json());

/******************** LOGIN ********************/
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [email, password]
    );
    if (rows.length > 0) {
      res.status(200).send("ok");
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    console.error(error);
    res.status(501).send(error.message);
  }
});

/******************** SIGN UP ********************/
router.post("/signup", async (req, res) => {
  const { user, email, password } = req.body;
  try {
    await pool.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [user, email, password]
    );
    res.status(200).send("ok");
  } catch (error) {
    console.error(error);
    res.status(501).send(error.message);
  }
});

module.exports = router;
