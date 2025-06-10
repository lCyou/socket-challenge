import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:8080"
  }
});

io.on("connection", (socket) => {
  // ...
});

httpServer.listen(3000);
