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
//enabling cors for our socket connection
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


//API request to generate an unique roomID for every meeting
app.get("/", (req, res) => {
    const meetID = uuidv4();
    res.send({ link: meetID });
});

//API request to fetch all channels realated to the user
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
        db.close();
    });
    

});
//API to create user and join to default channel
app.post("/createUser", (req,res) =>{
    MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, async function(err, db) {
        if (err) throw err;
        var dbo = db.db("ms_teams");
        var query = { username: req.body.username, channels: [{id: ObjectID("60e2db98f42957715cdd7087"), name: "Microsoft Engage 2021"}] };
        await dbo.collection("user_channels").insertOne(query);
        console.log("user created");
        const myDetails=await dbo.collection("user_channels").find({username: req.body.username}).toArray();
        await dbo.collection("channel").updateOne(
            { _id: ObjectID("60e2db98f42957715cdd7087") },
            { $push: {"participants": ObjectID(myDetails[0]._id)}}
        )
        console.log("user added to enagage channel");
        //successfully user created
        res.send();
        db.close();
    })
})
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
            await dbo.collection("channel").insert({ name: req.body.username.split("@")[0]+"'s Meeting at "+date,participants: [ObjectID(myDetails[0]._id)],sockets:[], link: req.body.link });
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
        console.log("updated");
        res.send(curChannel[0]);
        db.close();
    })
        
})
//listener for our socket connection
io.on('connection', socket => {
    console.log('socket established')
    socket.emit('connection', null);
    socket.on('join-room', (userData) => {
        //this executes only for a peer who has connected to the video call room
        const { roomID, userID, username } = userData;
        console.log(userData);
        socket.join(roomID);
        socket.to(roomID).emit('new', userData);
        socket.on('disconnect', () => {
            socket.to(roomID).emit('disconnected', userID);
        });
        socket.on('chat', (data) => {
            console.log(data);
            MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, async function(err, db) {
                if (err) throw err;
                var dbo = db.db("ms_teams");
                var query = { link: data.link };
                const curChannel= await dbo.collection("channel").find(query).toArray();
                await dbo.collection("channel").updateOne(
                    query,
                    { $push: {"messages": {channel_id:curChannel[0]._id , text:data.message, senderName:data.email , id:Date.now()}}}
                )
                console.log("saved");
                db.close();
            });
            socket.to(roomID).emit('new-chat', {...data, userData});
        });
        socket.on('user-video-toggle', (value) => {
            socket.to(roomID).emit('check-user-video-toggle', {userData, value });
        });
    });
    // joining the text channel
    socket.on('channel-join', (id) => {
        console.log('channel join', id);
        return id;
    });
    //chatting over the text channel
    socket.on('send-message', message => {
        console.log(message);
        MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, async function(err, db) {
            if (err) throw err;
            var dbo = db.db("ms_teams");
            var query = { _id: ObjectID(message.channel_id) };
            await dbo.collection("channel").updateOne(
                query,
                { $push: {"messages": message}}
            )
            console.log("saved");
            db.close();
        });
        io.emit('message', message);
    });
    //disconnecting from the socket connection
    socket.on('disconnect', () => {
    });
});

server.listen(port, () => {
    console.log(`Listening on the port ${port}`);
}).on('error', e => {
    console.error(e);
});