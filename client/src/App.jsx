import React, { useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client';
import './App.css'
const App = () => {
  const socket = useMemo(() => io("http://localhost:8080"), []);
  //socket/client
  const [socketId, setSocketId] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState('');     //to a particular person


  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(message);
    socket.emit("message", message, room);
    console.log("message sent");
    setMessage("");
  }


  const joinRoom = (e) => {
    e.preventDefault();
    console.log(`Joined group: ${room}`);
    socket.emit("join-room", room);
  }



  useEffect(() => {
    socket.on("connect", () => {
      setSocketId(socket.id);
      console.log(`Connected: ${socket.id}`);

      socket.on("forward-message", (data) => {
        console.log(data);
        setMessages((prevMessages) => [...prevMessages, data]);
      })
    })

    return () => {
      socket.disconnect();
    }
  }, [])


  return (
    <div>
      <h1>Welcome to NeuroChat Application</h1>
      <h3>Socket ID: {socketId}</h3>

      {/* From to send a message to a particular person */}
      <form onSubmit={handleSubmit}>
        <input value={message} placeholder='Enter your text to send...' onChange={(e) => { setMessage(e.target.value) }} />
        <input placeholder='Enter the User/Room Id: ' onChange={(e) => { setRoom(e.target.value) }} />
        <button type='submit'>SEND</button>
      </form>


      {/* Form to create a group and send a message in the group */}
      <form onSubmit={joinRoom}>
        <input value={room} placeholder='Enter the Room Name: ' onChange={(e) => { setRoom(e.target.value) }} />
        <button type='submit'>JOIN ROOM</button>
      </form>

      <div>
        <ul>
          {messages.map((item, index) => {
            return <li key={index}>{item}</li>
          })}
        </ul>
      </div>









    </div>
  )
}

export default App