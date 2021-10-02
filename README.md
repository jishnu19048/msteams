# Microsoft Teams Clone

This is a text, audio & video chatting web-applicaiton built on node js.  

![](https://drive.google.com/uc?export=view&id=1fRCqmO0uHZMx8OvyAQ6qgjTuknnzsodT)
![](https://drive.google.com/uc?export=view&id=1Xj2VjnmpLYlnksoIsELmk70q0ar6WA9r)

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

## Agile
The development was led forward with an agile mindset, following an iterative development & indulging in sprints for groups of features instead of one single feature due to time being limited. This allowed the development to be more organized thorughout and was able to easily infuse in, the feature that the 'adopt' stage asked for.

## Overview

The peer to peer communication is handled using the peerJS library for javascript and the connection to any room is managed by sockets using the sockets.IO library. Each peer that is on the current socket network had a collection of peers it is connected to. The socket connection allows the peers on this network to communicate among themselves by sending signals with data. The cloud peerJS servers are used to initialize every peer on the network. By default, peerJS is configured to connect to Google's **STUN** server, but for **TURN** servers, we have to manually configure the details while the peer is created.

WebRTC is used to access the media devices and capture the media stream using ``navigator.mediaDevices.getUserMedia()`` . For display streams like screensharing, etc. webrtc's ``navigator.mediaDevices.getDisplayMedia()`` allows users to capture their screen contents in a similar way. It allows us to access all the tracks of any media-stream(video or audio) which in turn allows us to enable or disable them accordingly and properly end streams on closing peer connections. A stream is sent over all the peer to peer connections present in the socket connection.  
Hence, visual, audio & textual communication is altogether implemented using peerJS, socketIO & webRTC.

The backend server is an express app with APIs to create users & channels, add user to channels, fetching user channels and generate user unique room-ids for channels. React was used to develop a simple, well-structured & responsive UI, while keeping an agile mindset.  

User-related details and channel detail are stored using MongoDB. A document based model was chosen as it allows json based query values and response values which makes querying for complex objects easier, hence aiding to rendering at the frontend.  
User authentication is added to the application using firebase along with React's Context to pass down user details to every child UI component.


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
The nodeJS backend is deployed on Heroku at https://ms-teams-backend.herokuapp.com/ & the react app is deployed on netlify at https://drgoli-teams.netlify.app/.

## Credits
- Material UI
- React-toast-notifications
- Symentic UI React
