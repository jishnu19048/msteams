# Microsoft Teams Clone

This is a text, audio & video chatting web-applicaiton running on node js.  
Live web-app: https://ms-teams-engage.netlify.app/


## Tech Stack

- The application was developed in the **nodeJS** runtime environment with **reactJS** as the primary library for the user interface, using the **socket.IO** & **peerJS** libararies as the main libraries for the backend development.
- User authentication:  **Firebase**
- Database for user and channel data: **MongoDB**
 

## Features

- Video & Audio meeting with real-time text chatting.
- Supports muting/unmuting audio, turning off/on camera & screen-sharing for seamless communication.
- Text channels for every meeting you have, so that you can always continue your conversations.
- Notifications so that you dont miss anything.
- Easy invitations using auto generated links.


## Overview
The peer to peer communication is handled using the peerJS library for javascript and the connection to any room is managed by sockets using the sockets.IO library. Each peer that is on the current socket network had a collection of peers it is connected to. The socket connection allows the peers on this network to communicate among themselves by sending signals with data. The cloud peerJS servers are used to initialize every peer on the network. 

WebRTC is used to access the media devices and capture the media stream. For display streams like screensharing, etc. webrtc's ``navigator.mediaDevices.getDisplayMedia()`` allows users to capture their screen contents in a similar way. It allows us to access all the tracks of any media-stream(video or audio) which in turn allows us to enable or disable them accordingly and properly end streams on closing peer connections. A stream is sent over all the peer to peer connections present in the socket connection.

Hence, visual, audio & textual communication is altogether implemented using peerJS, socketIO & webRTC.


## Development

- Clone the project using this command ``git clone https://github.com/jishnu19048/msteams``.
Make sure that you have git installed in your machine.
- Next change directories to server and then run ``npm install``
- Run the above command in the client directory to install all required dependencies.
- Now, to run the server, from the root directory of the project run the following commands.
-- ``cd /server/src``
-- ``node server.js``
-  To run the frontend, use a different terminal and run the following commands from the root directory of the project.
-- ``cd /client``
-- ``npm start``


## Deployment
The nodeJS backend is deployed on Heroku at https://ms-teams-backend.herokuapp.com/ & the react app is deployed on netlify at https://ms-teams-engage.netlify.app/.

