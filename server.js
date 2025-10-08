// backend/server.js
const express = require("express");
const cors = require("cors");
const http = require("http");
const { initCompileSocket } = require("./compile/compile"); // ✅ nouvelle importation

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);

/************** authentication *************/
const auth = require("./authentication");
app.use("/Auth", auth);

const files = require("./getInfo/files");
app.use("/files", files);

const profile = require("./getInfo/user");
app.use("/profile", profile);

/*************** Partage du code *****************/
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:4173"],
  },
});

const { generateRandomCode } = require("./utils/CodeGenerator");

io.on("connection", (socket) => {
  let Pgroup, admin;
  console.log("👤 Client connecté au partage de code");

  socket.on("create-group", () => {
    Pgroup = generateRandomCode();
    admin = socket.id;
    socket.join(Pgroup);
    socket.emit("new-group", Pgroup);
  });

  socket.on("UpdateCode", (code) => {
    socket.broadcast.to(Pgroup).emit("code", code);
  });

  socket.on("send-file", (file, id) => {
    socket.broadcast.to(id).emit("file", file);
  });

  socket.on("join-Group", (Group) => {
    if (socket.adapter.rooms.has(Group)) {
      Pgroup = Group;
      socket.join(Group);
      socket.broadcast
        .to(Pgroup)
        .emit("joined", socket.handshake.auth.email, socket.id);
    } else {
      socket.emit("error", "Group not found");
    }
  });

  socket.on("admin-disconnect", () => {
    socket.broadcast.to(Pgroup).emit("remove-group");
    socket.leave(Pgroup);
  });

  socket.on("leave-group", () => {
    socket.broadcast.to(Pgroup).emit("user-disconnect", socket.id);
  });

  socket.on("remove-user", (id) => {
    socket.broadcast.to(id).emit("remove-group");
  });

  socket.on("disconnect", () => {
    if (socket.id === admin) {
      socket.broadcast.to(Pgroup).emit("remove-group");
    } else {
      socket.broadcast.to(Pgroup).emit("user-disconnect", socket.id);
    }
  });
});

/*************** ⚙️ Initialiser le terminal interactif ***************/
initCompileSocket(server);

/*************** 🚀 Lancer le serveur ***************/
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur le port ${PORT}`);
});
