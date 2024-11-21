const express = require('express');
const app = express();
const { createServer } = require("http");
const server = createServer(app);
const { Server } = require('socket.io');
const port = 3001;

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
    }
});

io.on('connection', socket => {
    console.log(`A user connected: ${socket.id}`);

    socket.on('join_room', ({user, room}) => {
        console.log(`${user} joined room: ${room}`);
        socket.join(room);
    });

    socket.on('send_message', ({room, user, message}) => {
        console.log(`Message from ${user} in room ${room}: ${message}`);
        const d = {user: user, message: message};
        socket.to(room).emit('receive_msg', d);
    });

    socket.on('disconnect', () => {
        console.log(`A user disconnected: ${socket.id}`);
    });
});

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
