
import React, { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const App = () => {
  const socket = useMemo(() => io("http://localhost:8080"), []);
  const [socketId, setSocketId] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit("message", message, room);
      setMessage(""); // Clear input without manually adding the message
    }
  };

  const joinRoom = (e) => {
    e.preventDefault();
    if (room.trim()) {
      socket.emit("join-room", room);
    }
  };

  useEffect(() => {
    socket.on("connect", () => {
      setSocketId(socket.id);
      console.log(`Connected: ${socket.id}`);
    });

    socket.on("forward-message", (data) => {
      console.log("Received message:", data);
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.on("previous-messages", (data) => {
      console.log("Old messages:", data);
      setMessages(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>Welcome to NeuroChat Application</h1>
      <h3>Socket ID: {socketId}</h3>
      <form onSubmit={handleSubmit}>
        <input value={message} placeholder='Enter message...' onChange={(e) => setMessage(e.target.value)} />
        <input placeholder='Enter Room ID' onChange={(e) => setRoom(e.target.value)} />
        <button type='submit'>SEND</button>
      </form>
      <form onSubmit={joinRoom}>
        <input value={room} placeholder='Enter Room Name' onChange={(e) => setRoom(e.target.value)} />
        <button type='submit'>JOIN ROOM</button>
      </form>
      <div>
        <ul>
          {messages.map((item, index) => (
            <li key={index}>
              <strong>{item.sender === socketId ? "You" : "Sender"}:</strong> {item.text || "No message"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
