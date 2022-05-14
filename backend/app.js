const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 2002;

app.use(cors());

app.use(express.static("../frontend"));
app.use(express.static("../frontend/libs"));
app.use(express.static("../frontend/assets"));
app.get("/", function (req, res) {
  res.sendFile(__dirname + "../frontend/index.html");
});

io.sockets.on("connection", function (socket) {
  socket.userData = { x: 0, y: 0, z: 0, heading: 0 }; //Default values;

  console.log(`${socket.id} connected`);
  socket.emit("setId", { id: socket.id });

  socket.on("disconnect", function () {
    console.log(`${socket.id} deleted`);
    socket.broadcast.emit("deletePlayer", { id: socket.id });
  });

  socket.on("init", function (data) {
    console.log(`socket.init ${data.model}`);
    socket.userData.model = data.model;
    socket.userData.colour = data.colour;
    socket.userData.x = data.x;
    socket.userData.y = data.y;
    socket.userData.z = data.z;
    socket.userData.heading = data.h;
    socket.userData.nameTag = data.nameTag;
    (socket.userData.pb = data.pb), (socket.userData.action = "Idle");
  });

  socket.on("update", function (data) {
    socket.userData.x = data.x;
    socket.userData.y = data.y;
    socket.userData.z = data.z;
    socket.userData.heading = data.h;
    socket.userData.nameTag = data.nameTag;
    (socket.userData.pb = data.pb), (socket.userData.action = data.action);
  });

  socket.on("chat message", function (data) {
    console.log(`chat message:${data.id} ${data.message}`);
    socket.broadcast.emit("chat", { id: data.id, message: data.message });
  });
});

http.listen(port, function () {
  console.log(`listening on ${port}`);
});

setInterval(function () {
  const nsp = io.of("/");
  let pack = [];

  for (let id in io.sockets.sockets) {
    const socket = nsp.connected[id];
    //Only push sockets that have been initialised
    if (socket.userData.model !== undefined) {
      pack.push({
        id: socket.id,
        model: socket.userData.model,
        colour: socket.userData.colour,
        x: socket.userData.x,
        y: socket.userData.y,
        z: socket.userData.z,
        heading: socket.userData.heading,
        pb: socket.userData.pb,
        action: socket.userData.action,
        nameTag: socket.userData.nameTag,
      });
    }
  }
  if (pack.length > 0) io.emit("remoteData", pack);
}, 40);
