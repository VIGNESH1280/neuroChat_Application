
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log(err));

const messageSchema = new mongoose.Schema({
  text: String,
  room: String,
  sender: String,
  timestamp: { type: Date, default: Date.now },
});
const Message = mongoose.model("Message", messageSchema);

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Send old messages when a user joins a room
  socket.on("join-room", async (roomName) => {
    socket.join(roomName);
    console.log(`Group joined: ${roomName}`);
    const messages = await Message.find({ room: roomName }).sort("timestamp");
    socket.emit("previous-messages", messages);
  });

  // Handle messages
  socket.on("message", async (data, room) => {
    console.log(`Message received from ${socket.id}:`, data);
    const newMessage = new Message({ text: data, room, sender: socket.id });
    await newMessage.save();
    socket.to(room).emit("forward-message", { text: data, sender: socket.id });
  });

  socket.on("disconnect", () => {
    console.log(`${socket.id} has been disconnected`);
  });
});

const port = process.env.PORT || 8080;
httpServer.listen(port, () => {
  console.log(`Server running on PORT: ${port}`);
});
