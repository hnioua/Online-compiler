require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { GoogleGenerativeAI } = require("@google/generative-ai");

/* =========================
   🔌 MySQL Pool
========================= */
const db = require("./db"); // 👈 IMPORT CORRECT DU POOL MYSQL

/* =========================
   🚀 Express App
========================= */
const app = express();
app.use(express.json({ limit: "500kb" }));
app.use(cors());

const server = http.createServer(app);

/* =========================
   🔑 Routes Métier
========================= */
app.use("/Auth", require("./authentication"));
app.use("/files", require("./getInfo/files"));
app.use("/profile", require("./getInfo/user"));

app.use("/api/users", require("./routes/users"));
app.use("/api/files", require("./routes/files"));
app.use("/api/exercises", require("./routes/exercises"));
app.use("/api/exercise_attempts", require("./routes/exercise_attempts"));
app.use("/api/error_types", require("./routes/error_types"));
app.use("/api/attempt_errors", require("./routes/attempt_errors"));
app.use("/api/ratings", require("./routes/ratings"));
app.use("/api/level_history", require("./routes/level_history"));

/* =========================
   🤖 Gemini AI Setup
========================= */
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY manquante");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-flash-latest",
  generationConfig: {
    responseMimeType: "application/json",
  },
});

/* =========================
   🤖 ANALYZE + SAVE
========================= */
app.post("/analyze", async (req, res) => {
  try {
    const { code, user_id, exercise_id, time_spent = 0 } = req.body;

    /* ---------- Validation ---------- */
    if (!code || !user_id || !exercise_id) {
      return res.status(400).json({
        error: "code, user_id et exercise_id sont requis",
      });
    }

    /* ---------- Prompt ---------- */
    const prompt = `
Tu es un professeur expert en langage C.

Analyse le code suivant :
- détecte erreurs syntaxe, logique et mémoire
- indique si l'exercice est résolu
- donne un score entre 0 et 100
- fournis le code corrigé

Réponds UNIQUEMENT en JSON strict :

{
  "resolu": boolean,
  "score": number,
  "erreurs": [
    { "type": "syntaxe|logique|memoire", "description": "string", "ligne": number }
  ],
  "codeCorrect": "string",
  "commentaire": "string"
}

CODE :
${code}
`;

    /* ---------- Gemini Call ---------- */
    const result = await model.generateContent(prompt);
    const raw = result?.response?.text();

    if (!raw) throw new Error("Réponse Gemini vide");

    let data;
    try {
      const cleaned = raw.replace(/```json|```/gi, "").trim();
      data = JSON.parse(cleaned);
    } catch (e) {
      return res.status(500).json({
        error: "JSON Gemini invalide",
        raw,
      });
    }

    /* ---------- Logique métier ---------- */
    const isSuccess = data.resolu === true && data.erreurs.length === 0;
    const score =
      typeof data.score === "number" ? data.score : isSuccess ? 100 : 0;
    // Vérifier si la tentative existe déjà
    const [rows] = await db.execute(
      `SELECT * FROM exercise_attempts WHERE user_id = ? AND exercise_id = ?`,
      [user_id, exercise_id]
    );

    if (rows.length > 0) {
      // ✅ Ligne existante → update
      await db.execute(
        `
    UPDATE exercise_attempts
    SET
      success = ?,
      score = ?,
      time_spent = time_spent + ?,
      attempts_count = attempts_count + 1
    WHERE user_id = ? AND exercise_id = ?
    `,
        [isSuccess, score, time_spent, user_id, exercise_id]
      );
    } else {
      // ✅ Ligne n'existe pas → insert
      await db.execute(
        `
    INSERT INTO exercise_attempts
      (user_id, exercise_id, success, score, time_spent, attempts_count)
    VALUES (?, ?, ?, ?, ?, 1)
    `,
        [user_id, exercise_id, isSuccess, score, time_spent]
      );
    }

    console.log(`
💾 Tentative enregistrée
👤 User: ${user_id}
📘 Exercice: ${exercise_id}
⏱️ Temps: ${time_spent}s
⭐ Score: ${score}
✅ Success: ${isSuccess}
`);

    res.json({
      ...data,
      success: isSuccess,
      score,
    });
  } catch (err) {
    console.error("❌ /analyze error:", err.message);

    if (err.message.includes("429")) {
      return res.status(429).json({ error: "Quota Gemini atteint" });
    }

    res.status(500).json({ error: "Erreur serveur" });
  }
});


/* =========================
   📡 Socket.io
========================= */
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:4173"],
  },
});

const { generateRandomCode } = require("./utils/CodeGenerator");
const { initCompileSocket } = require("./compile/compile");

io.on("connection", (socket) => {
  let Pgroup;
  console.log(`👤 Client connecté: ${socket.id}`);

  socket.on("create-group", () => {
    Pgroup = generateRandomCode();
    socket.join(Pgroup);
    socket.emit("new-group", Pgroup);
  });

  socket.on("UpdateCode", (code) => {
    socket.broadcast.to(Pgroup).emit("code", code);
  });

  socket.on("join-Group", (Group) => {
    if (io.sockets.adapter.rooms.has(Group)) {
      Pgroup = Group;
      socket.join(Group);
      socket.broadcast.to(Pgroup).emit("joined", socket.id);
    }
  });

  socket.on("disconnect", () => {
    console.log(`🔴 Client déconnecté: ${socket.id}`);
    if (Pgroup) {
      socket.broadcast.to(Pgroup).emit("user-disconnect", socket.id);
    }
  });
});

/* =========================
   ⚙️ Terminal interactif
========================= */
initCompileSocket(io);

/* =========================
   🚀 Server Start
========================= */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});
