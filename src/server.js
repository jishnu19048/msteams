const express = require("express");
const app = express();
var cors = require('cors');
app.use(cors());
const server = require("http").Server(app);
const { v4: uuidv4 } = require('uuid');
var STATIC_CHANNELS = [{
    name: 'Microsoft Engage 2021',
    participants: 0,
    id: 1,
    sockets: []
}, {
    name: 'Test Channel',
    participants: 0,
    id: 2,
    sockets: []
}];
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
app.get("/getChannels", (req,res) => {
    res.json({channels: STATIC_CHANNELS})
});
//listener for our socket
io.on('connection', socket => {
    console.log('socket established')
    socket.on('join-room', (userData) => {
        const { roomID, userID, username } = userData;
        console.log(userData);
        socket.join(roomID);
        socket.to(roomID).emit('new', userData);
        socket.on('disconnect', () => {
            socket.to(roomID).emit('disconnected', userID);
        });
        socket.on('chat', (data) => {
            console.log(data);
            socket.to(roomID).emit('new-chat', {...data, userData});
        });
        socket.on('user-video-toggle', (value) => {
            socket.to(roomID).emit('check-user-video-toggle', {userData, value });
        });
    });
    socket.on('channel-join', (id) => {
        console.log('channel join', id);
        STATIC_CHANNELS.forEach(c => {
            if (c.id === id) {
                if (c.sockets.indexOf(socket.id) == (-1)) {
                    c.sockets.push(socket.id);
                    c.participants++;
                    io.emit('channel', c);
                }
            } else {
                let index = c.sockets.indexOf(socket.id);
                if (index != (-1)) {
                    c.sockets.splice(index, 1);
                    c.participants--;
                    io.emit('channel', c);
                }
            }
        });
        return id;
    })
    socket.on('disconnect', () => {
        STATIC_CHANNELS.forEach(c => {
            let index = c.sockets.indexOf(socket.id);
            if (index != (-1)) {
                c.sockets.splice(index, 1);
                c.participants--;
                io.emit('channel', c);
            }
        });
    });
});

server.listen(port, () => {
    console.log(`Listening on the port ${port}`);
}).on('error', e => {
    console.error(e);
});