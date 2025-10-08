// backend/compile.js
const { Server } = require("socket.io");
const { spawn } = require("child_process");
const fs = require("fs");

function initCompileSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:4173"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Client connecté au terminal interactif");

    let childProcess = null;

    socket.on("run-code", ({ code }) => {
      try {
        fs.writeFileSync("program.c", code);

        const compile = spawn("gcc", ["program.c", "-o", "program"]);

        compile.on("close", (code) => {
          if (code === 0) {
            socket.emit("output", "✅ Compilation réussie !\n");

            childProcess = spawn("./program");

            childProcess.stdout.on("data", (data) => {
              socket.emit("output", data.toString());
            });

            childProcess.stderr.on("data", (data) => {
              socket.emit("output", data.toString());
            });

            childProcess.on("close", (code) => {
              socket.emit("output", `\n🚀 Programme terminé (code: ${code})\n`);
            });
          } else {
            socket.emit("output", "❌ Erreur de compilation\n");
          }
        });
      } catch (err) {
        console.error(err);
        socket.emit("output", "❌ Erreur interne côté serveur\n");
      }
    });

    socket.on("user-input", (input) => {
      if (childProcess) {
        childProcess.stdin.write(input + "\n");
      }
    });

    socket.on("disconnect", () => {
      console.log("🔴 Client déconnecté");
      if (childProcess) childProcess.kill();
    });
  });

  console.log("⚡ Terminal interactif prêt via Socket.io");
}

module.exports = { initCompileSocket };
