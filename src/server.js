const express = require("express");
const app = express();
var cors = require('cors');
app.use(cors());
const server = require("http").Server(app);
const { v4: uuidv4 } = require('uuid');
//enabling cors
const io = require("socket.io")(server, {
    cors:{
        origins: ["*"],
    handlePreflightRequest: (req, res) => {
        const headers = {
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Origin": "*", //or the specific origin you want to give access to,
            "Access-Control-Allow-Credentials": true
        };
        res.writeHead(200, headers);
        res.end();
    }}
});
const port = process.env.PORT || 8080;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    const meetID = uuidv4();
    res.send({ link: meetID });
});
//listener for our socket
io.on('connection', socket => {
    console.log('socket established')
    socket.on('join-room', (userData) => {
        const { roomID, userID } = userData;
        socket.join(roomID);
        socket.to(roomID).emit('new', userData);
        socket.on('disconnect', () => {
            socket.to(roomID).emit('disconnected', userID);
        });
        socket.on('chat', (data) => {
            console.log(data);
            socket.to(roomID).emit('new-chat', {...data, userData});
        });
        // socket.on('reconnect-user', () => {
        //     socket.to(roomID).broadcast.emit('new-user-connect', userData);
        // });
        socket.on('user-video-toggle', (value) => {
            socket.to(roomID).emit('check-user-video-toggle', {userData, value });
        });
    });
});

server.listen(port, () => {
    console.log(`Listening on the port ${port}`);
}).on('error', e => {
    console.error(e);
});