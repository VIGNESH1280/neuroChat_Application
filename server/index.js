import express from "express";
import { createServer } from "http"; //to create a http server
import { Server } from "socket.io"; //enables WebRTC, bi-directional comm.
import cors from "cors";
import dotenv from "dotenv";
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});





io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("message", (data, roomNo) => {
    console.log(data);
    socket.to(roomNo).emit("forward-message", data);
    socket;
  });

  socket.on("join-room", (roomName) => {
    socket.join(roomName);
    console.log(`Gropup joined: ${roomName}`);
  });

  socket.on("disconnect", () => {
    console.log(`${socket.id} has been disconnected`);
  });
});






dotenv.config();
const port = process.env.port;
httpServer.listen(port, () => {
  console.log(`http Server is running at PORT: ${port}`);
});
