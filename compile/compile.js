// backend/compile.js
const { Server } = require("socket.io");
const { spawn } = require("child_process");
const fs = require("fs");

function initCompileSocket(io) {
  const path = require("path");
  const os = require("os");

  // Ensure temp directory exists
  const tempDir = path.join(__dirname, "temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  io.on("connection", (socket) => {
    console.log(`🟢 Client connecté au terminal interactif: ${socket.id}`);

    let childProcess = null;
    let currentSourcePath = null;
    let currentExePath = null;

    const cleanup = () => {
      try {
        if (currentSourcePath && fs.existsSync(currentSourcePath)) {
          fs.unlinkSync(currentSourcePath);
        }
        if (currentExePath && fs.existsSync(currentExePath)) {
          fs.unlinkSync(currentExePath);
        }
      } catch (e) {
        console.error("Cleanup error:", e);
      }
    };

    socket.on("run-code", ({ code }) => {
      // Clean up previous run if any
      cleanup();

      const uniqueId = `${socket.id}_${Date.now()}`;
      const sourceFilename = `program_${uniqueId}.c`;
      const exeFilename = `program_${uniqueId}${process.platform === "win32" ? ".exe" : ""}`;

      currentSourcePath = path.join(tempDir, sourceFilename);
      currentExePath = path.join(tempDir, exeFilename);

      try {
        fs.writeFileSync(currentSourcePath, code);

        // Use absolute paths for gcc output
        const compile = spawn("gcc", [currentSourcePath, "-o", currentExePath]);

        compile.on("close", (exitCode) => {
          if (exitCode === 0) {
            socket.emit("output", "✅ Compilation réussie !\n");

            // Execute the compiled binary
            childProcess = spawn(currentExePath);

            childProcess.stdout.on("data", (data) => {
              socket.emit("output", data.toString());
            });

            childProcess.stderr.on("data", (data) => {
              socket.emit("output", data.toString());
            });

            childProcess.on("close", (code) => {
              socket.emit("output", `\n🚀 Programme terminé (code: ${code})\n`);
              cleanup(); // Clean up after execution
            });

            childProcess.on("error", (err) => {
              socket.emit("output", `\n❌ Erreur d'exécution: ${err.message}\n`);
              cleanup();
            });

          } else {
            socket.emit("output", "❌ Erreur de compilation\n");
            // Capture compilation errors if needed, usually they go to stderr of the compile process
            // But here we didn't listen to compile.stderr. Let's add it.
          }
        });

        compile.stderr.on("data", (data) => {
          socket.emit("output", data.toString());
        });

        compile.on("error", (err) => {
          socket.emit("output", `❌ Erreur de lancement du compilateur: ${err.message}\n`);
        });

      } catch (err) {
        console.error(err);
        socket.emit("output", "❌ Erreur interne côté serveur\n");
        cleanup();
      }
    });

    socket.on("user-input", (input) => {
      if (childProcess && !childProcess.killed) {
        try {
          childProcess.stdin.write(input + "\n");
        } catch (e) {
          console.error("Error writing to stdin:", e);
        }
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔴 Client déconnecté: ${socket.id}`);
      if (childProcess) childProcess.kill();
      cleanup();
    });
  });

  console.log("⚡ Terminal interactif prêt via Socket.io");
}

module.exports = { initCompileSocket };
