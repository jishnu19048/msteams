const express = require("express");
const app = express();
const { MongoClient, ObjectID } = require("mongodb");
//connect to MongoDB cluster
const uri = "mongodb+srv://jishnu19048:Duliajan7@engage.jrkct.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
//enable CORS
var cors = require('cors');
app.use(cors());
const server = require("http").Server(app);
const { v4: uuidv4 } = require('uuid');
var STATIC_CHANNELS = [{
    name: 'Microsoft Engage 2021',
    participants: 0,
    id: 1,
    sockets: [],
    link: "6bc2fe22-a9b2-46b8-baab-961fb293549d"
}, {
    name: 'Test Channel',
    participants: 0,
    id: 2,
    sockets: [],
    link: "fe7acefb-b805-4ff2-808c-c3288f5af0a0"
}];
//enabling cors for socket connection
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

//function to fetch all channels realated to the user

app.get("/", (req, res) => {
    const meetID = uuidv4();
    res.send({ link: meetID });
});
app.get("/getUserChannels/:username", (req, res) => {
    MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, async function(err, db) {
        if (err) throw err;
        var dbo = db.db("ms_teams");
        var query = { username: req.params.username };
        const allChannels=await dbo.collection("user_channels").find(query).toArray();
        let allUserChannels=[];
        //asynchronus for loop WOW ***forEach doesnt work if you want to sequentially access the array
        for (const c of allChannels[0].channels) {
            const channelDetails=await dbo.collection("channel").find({_id: c.id}).toArray();
            // console.log(channelDetails);
            allUserChannels.push(channelDetails[0]);
        }
        res.send(allUserChannels);
    });
});
//API to create channel and join channel
app.post("/createAndAddChannel", (req,res) => {
    MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, async function(err, db) {
        if (err) throw err;
        var dbo = db.db("ms_teams");
        var query = { link: req.body.link };
        //get the details of the current account
        const myDetails=await dbo.collection("user_channels").find({username: req.body.username}).toArray();
        const date=new Date(new Date().getTime()).toLocaleTimeString();
        const channelCheck=await dbo.collection("channel").find(query).toArray();
        //if channel is not already made, create it
        if(channelCheck.length==0){
            await dbo.collection("channel").insert({ name: "User Meeting at "+date,participants: [ObjectID(myDetails[0]._id)],sockets:[], link: req.body.link });
            console.log("Successfully added new channel");
        }
        const curChannel= await dbo.collection("channel").find(query).toArray();
        //update the participants array in the channel
        await dbo.collection("channel").updateOne(
            query,
            { $pull: {"participants": ObjectID(myDetails[0]._id)}}
        )
        await dbo.collection("channel").updateOne(
            query,
            { $push: {"participants": ObjectID(myDetails[0]._id)}}
        )
        //update the channels array for the current account
        await dbo.collection("user_channels").updateOne(
            {username: req.body.username},
            { $pull: {"channels": {id : ObjectID(curChannel[0]._id),name: curChannel[0].name}}}
        )
        await dbo.collection("user_channels").updateOne(
            {username: req.body.username},
            { $push: {"channels": {id : ObjectID(curChannel[0]._id),name: curChannel[0].name}}}
        )
        res.send();
    })
        
})
//listener for our socket
io.on('connection', socket => {
    console.log('socket established')
    socket.emit('connection', null);
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
    });
    socket.on('send-message', message => {
        console.log(message);
        io.emit('message', message);
    });
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