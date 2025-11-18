import { Server } from "socket.io";
import { createServer } from "http";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});

io.on("connection", (socket) => {
  console.log("Peer connected:", socket.id);

  // kirim pesan ke peer lain
  socket.on("signal", (data) => {
    socket.broadcast.emit("signal", {
      from: socket.id,
      ...data
    });
  });

  socket.on("disconnect", () => {
    console.log("Peer disconnected:", socket.id);
    socket.broadcast.emit("peer-left", socket.id);
  });
});

httpServer.listen(3000, () => {
  console.log("Signaling server running at http://localhost:3000");
});
