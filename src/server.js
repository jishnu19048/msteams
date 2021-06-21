const express = require("express");
const app = express();
var cors = require('cors');
app.use(cors());
const server = require("http").Server(app);
const { v4: uuidv4 } = require('uuid');
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
// const socketIO = require('socket.io');
// const io = socketIO(server);
const port = process.env.PORT || 8080;
// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
//   });
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    const meetID = uuidv4();
    res.send({ link: meetID });
});
//listener for our socket
io.on('connection', socket => {
    socket.on('join-room', (roomID, userID) => {
        console.log('Joinned room', roomID);
        socket.join(roomID);
        socket.to(roomID).emit('new', userID);
        socket.on('disconnect', () => {
            socket.to(roomID).emit('disconnected', userID);
        });
    });
});

server.listen(port, () => {
    console.log(`Listening on the port ${port}`);
}).on('error', e => {
    console.error(e);
});