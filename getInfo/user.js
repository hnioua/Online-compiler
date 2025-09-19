const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");

// Connexion MySQL
const pool = mysql.createPool({
  host: "localhost",
  user: "root", // ⚡ change si nécessaire
  password: "", // ⚡ ton mot de passe
  database: "IDE", // ⚡ ta base MySQL
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

router.use(express.json());

/******************** USER LOGIN ********************/
router.post("/user", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [email, password]
    );
    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/******************** GET USER BY LOGIN ********************/
router.post("/", async (req, res) => {
  try {
    const { login } = req.body;
    console.log(login);
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      login,
    ]);

    if (rows.length > 0) {
      console.log(rows);
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

/******************** UPDATE USER ********************/
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

module.exports = router;
