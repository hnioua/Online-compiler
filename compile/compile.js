const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

async function compile(code, input) {
  const compileDir = path.join(__dirname, "compile");
  if (!fs.existsSync(compileDir)) fs.mkdirSync(compileDir);

  const timestamp = Date.now(); // nom unique
  const sourceFile = path.join(compileDir, `program_${timestamp}.c`);
  const outputFile = path.join(compileDir, `program_${timestamp}.exe`);

  return new Promise((resolve, reject) => {
    fs.writeFile(sourceFile, code, (err) => {
      if (err) return reject(err);

      let output = "";
      let error = "";

      const gcc = spawn("C:/Users/pc/Downloads/mingw64/bin/gcc.exe", [
        sourceFile,
        "-o",
        outputFile,
      ]);

      gcc.stderr.on("data", (data) => (error += data.toString()));

      gcc.on("close", () => {
        if (error) return reject(error);

        const program = spawn(outputFile, [], { shell: true });

        program.stdout.on("data", (data) => (output += data.toString()));
        program.stderr.on("data", (data) => (error += data.toString()));

        program.on("close", () => {
          if (error) reject(error);
          else resolve(output);
        });

        if (input) {
          input
            .split(/\r?\n/)
            .forEach((line) => program.stdin.write(line + "\n"));
        }
        program.stdin.end();
      });
    });
  });
}

module.exports = { compile };
