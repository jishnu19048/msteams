const openSocket = require('socket.io-client');
const Peer = require('peerjs');
let socketInstance=null;
let peers = {};
const initializePeerConnection = () => {
    var peer=new window.Peer('', {
        /// Use ICE Servers for NAT connections :)
        // Just uncomment this
        // config: {
        //     'iceServers': [
        //         { url: 'stun:stun1.l.google.com:19302' },
        //         {
        //             url: 'turn:numb.viagenie.ca',
        //             credential: 'muazkh',
        //             username: 'webrtc@live.com'
        //         }
        //     ]
        // }
    });
    return peer;
}
const initializeSocketConnection = () => {
    return openSocket.connect('https://ms-teams-backend.herokuapp.com/', { 
        
        secure: true, 
        reconnection: true, 
        rejectUnauthorized: false,
        reconnectionAttempts: 1
    });
}
class Connection {
    videoContainer = {};
    message;
    streaming = false;
    myPeer;
    socket;
    myID = '';
    displayName;
    peerDisplayName={};
    settings;
    
    constructor(settings){
        this.displayName=settings.username;
        this.settings=settings;
        this.socket = initializeSocketConnection();
        this.myPeer = initializePeerConnection();
        this.initializeSocketEvents();
        this.initializePeersEvents();
    }
    initializeSocketEvents = () => {
        this.socket.on('connect', () => {
            console.log('socket connected');
        });
        this.socket.on('new-chat', message => {
            console.log(message);
            const newItem = {id: Date.now(),modifier:"him",text:message.message, user:message.displayName}
            this.message=newItem;
            this.settings.updateInstance('messageItemsNew', this.message);
            // const messageItem = document.createElement('li');
            // messageItem.classList.add(message.modifier);
            // messageItem.innerHTML=`<div><i>`+message.user+` , `+new Date(new Date().getTime()).toLocaleTimeString()+`</i></div>
            // <span>`+message.text+`</span>`
            // chatList.appendChild(messageItem);
        });
        this.socket.on('check-user-video-toggle', value => {
            console.log(value.userDatauserID +"video status"+ value.value);
            if(value.value){
                this.switchVideoOff(value.userData);
            }else{
                this.switchVideoOn(value.userData);
            }
        });
        this.socket.on('disconnected', (userID) => {
            console.log('user disconnected-- closing peers', userID);
            peers[userID] && peers[userID].close();
            this.removeVideo(userID);
        });
        this.socket.on('disconnect', () => {
            console.log('socket disconnected --');
        });
        this.socket.on('error', (err) => {
            console.log('socket error --', err);
        });
    }
    initializePeersEvents = () => {
        this.myPeer.on('open', (id) => {
            this.myID = id;
            const roomID = window.location.pathname.split('/')[2];
            const userData = {
                userID: id, roomID, username: this.displayName
            }
            console.log('peers established and joined room', userData);
            this.setNavigatorToStream(userData);
        });
        this.myPeer.on('error', (err) => {
            console.log('peer connection error', err);
            this.myPeer.reconnect();
        })
    }
    setNavigatorToStream = (userData) => {
        this.getVideoAudioStream().then((stream) => {
            if (stream) {
                this.socket.emit('join-room', userData);
                this.streaming = true;
                console.log("this point");
                this.createVideo({ id: this.myID, stream });
                this.setPeersListeners(stream);
                this.newUserConnection(stream);
            }
        })
    }
    sendMessage = (data) => {
        this.socket.emit('chat', data);
    }
    getVideoAudioStream = (video=true, audio=true) => {
        let quality = 12;
        // const status=this.checkForVideoAudioAccess();
        // console.log(status);
        return navigator.mediaDevices.getUserMedia({
            video: video ? {
                frameRate: quality ? quality : 12,
                noiseSuppression: true,
                width: {min: 640, ideal: 1280, max: 1920},
                height: {min: 480, ideal: 720, max: 1080}
            } : false,
            audio: audio,
        });
    }
    createVideo = (createObj) => {
        if (!this.videoContainer[createObj.id]) {
            this.videoContainer[createObj.id] = {
                ...createObj,
            };
            const roomContainer = document.getElementById('video-grid');
            const videoContainer = document.createElement('div');
            const video = document.createElement('video');
            video.classList.add('display-media');
            video.srcObject = this.videoContainer[createObj.id].stream;
            video.id = createObj.id;
            video.autoplay = true;
            // mute own stream
            if (this.myID === createObj.id) video.muted = true;
            videoContainer.appendChild(video)
            roomContainer.append(videoContainer);
        } else {
            document.getElementById(createObj.id).srcObject = createObj.stream;
        }
    }
    switchVideoOff(userData){
        const { roomID, userID } =userData;
        const myVideo =  document.getElementById(userID);
        myVideo.srcObject.getVideoTracks()[0].enabled=false;
    }
    switchVideoOn(userData){
        const { roomID, userID } =userData;
        const myVideo =  document.getElementById(userID);
        myVideo.srcObject.getVideoTracks()[0].enabled=true;
    }
    toggleAudio = () => {
        const myVideo =  this.getMyVideo();
        const status=myVideo.srcObject.getAudioTracks()[0].enabled;
        if(status){
            myVideo.srcObject.getAudioTracks()[0].enabled = false;
        }else{
            myVideo.srcObject.getAudioTracks()[0].enabled = true;
        }
    }
    reInitializeStream = (video, audio, type='userMedia') => {
        console.log(type);
        const media = type === 'userMedia' ? this.getVideoAudioStream(video, audio) : navigator.mediaDevices.getDisplayMedia();
        return new Promise((resolve) => {
            media.then((stream) => {
                const myVideo = this.getMyVideo();
                if (type === 'displayMedia') {
                    myVideo.classList.remove('display-media');
                    this.toggleVideoTrack(video, audio);
                    this.listenToEndStream(stream, {video, audio});
                    this.socket.emit('display-media', true);
                }
                if (myVideo) myVideo.srcObject?.getVideoTracks().forEach((track) => {
                    if (track.kind === 'video') {
                        track.stop();
                    }
                });
                checkAndAddClass(myVideo, type);
                this.createVideo({ id: this.myID, stream });
                replaceStream(stream);
                resolve(true);
            });
        });
    }
    listenToEndStream = (stream, status) => {
        const videoTrack = stream.getVideoTracks();
        if (videoTrack[0]) {
            videoTrack[0].onended = () => {
                this.socket.emit('display-media', false);
                this.reInitializeStream(!status.video, status.audio, 'userMedia').then(() => {
                    console.log("off");
                    this.settings.updateInstance('displayStream', false);
                    this.settings.updateInstance('camStatus', true);
                });
                // this.settings.updateInstance('displayStream', false);
            }
        }
    };
    getMyVideo = (id=this.myID) => {
        return document.getElementById(id);
    }
    toggleVideoTrack = (video, audio) => {
        const myVideo = this.getMyVideo();
        if (myVideo && !video) myVideo.srcObject?.getVideoTracks().forEach((track) => {
            if (track.kind === 'video') {
                !video && track.stop();
            }
        });
        else if (myVideo) {
            this.reInitializeStream(video,audio);
        }
    }
    removeVideo = (id) => {
        delete this.videoContainer[id];
        const video = document.getElementById(id);
        if (video) video.remove();
    }
    setPeersListeners = (stream) => {
        this.myPeer.on('call', (call) => {
            call.answer(stream);
            this.peerDisplayName[call.metadata.id]=call.metadata.username;
            document.getElementById('userList').innerHTML=``;
            for (const [key, value] of Object.entries(this.peerDisplayName)) {
                document.getElementById('userList').innerHTML+=`<div id=`+key+"Avatar"+` class="circle">
                <span class="initials">`+value[0]+`</span>
              </div>`;
            }
            call.on('stream', (userVideoStream) => {console.log('user stream data', 
            userVideoStream)
                this.createVideo({ id: call.metadata.id, stream: userVideoStream });
            });
            call.on('close', () => {
                console.log('closing peers listeners', call.metadata.id);
                delete this.peerDisplayName[call.metadata.id];
                const userAvatar = document.getElementById(call.metadata.id+"Avatar");
                if (userAvatar) userAvatar.remove();
                this.removeVideo(call.metadata.id);
            });
            call.on('error', () => {
                console.log('peer error ------');
                this.removeVideo(call.metadata.id);
            });
            peers[call.metadata.id] = call;
        });
    }
    newUserConnection = (stream) => {
        console.log("checking for new users");
        this.socket.on('new', (userData) => {
            console.log('New User Connected', userData);
            this.peerDisplayName[userData.userID]=userData.username;
            document.getElementById('userList').innerHTML=``;
            for (const [key, value] of Object.entries(this.peerDisplayName)) {
                document.getElementById('userList').innerHTML+=`<div id=`+key+"Avatar"+` class="circle">
                <span class="initials">`+value[0]+`</span>
              </div>`;
            }
            // console.log(this.peerDisplayName);
            this.connectToNewUser(userData, stream);
        });
    }
    connectToNewUser(userData, stream) {
        const { userID } = userData;
        const call = this.myPeer.call(userID, stream, { metadata: { id: this.myID, username: this.displayName }});
        call.on('stream', (userVideoStream) => {
            this.createVideo({ id: userID, stream: userVideoStream, userData });
        });
        call.on('close', () => {
            console.log('closing new user', userID);
            delete this.peerDisplayName[userID];
            const userAvatar = document.getElementById(userID+"Avatar");
            if (userAvatar) userAvatar.remove();
            this.removeVideo(userID);
        });
        call.on('error', () => {
            console.log('peer error ------')
            this.removeVideo(userID);
        })
        peers[userID] = call;
    }
    endConnection = () => {
        if(this.videoContainer[this.myID]==null){
            return;
        }
        const myMediaTracks = this.videoContainer[this.myID].stream.getTracks();
        for (const t of myMediaTracks) {
            console.log("hi");
            t.stop();
        }
        const myVideo = this.getMyVideo();
        if (myVideo){
            const allTracks = myVideo.srcObject?.getTracks();
            for (const t of allTracks) {
                t.stop();
            }
        }
        socketInstance.socket.disconnect();
        this.myPeer.destroy();
    }
}
const replaceStream = (mediaStream) => {
    //for replacing each track that is being sent on the connection :)
    Object.values(peers).map((peer) => {
        peer.peerConnection?.getSenders().map((sender) => {
            if(sender.track.kind == "audio") {
                if(mediaStream.getAudioTracks().length > 0){
                    sender.replaceTrack(mediaStream.getAudioTracks()[0]);
                }
            }
            if(sender.track.kind == "video") {
                if(mediaStream.getVideoTracks().length > 0){
                    sender.replaceTrack(mediaStream.getVideoTracks()[0]);
                }
            }
        });
    })
}
const checkAndAddClass = (video, type) => {
    if (video?.classList?.length === 0 && type === 'userMedia'){
        video.classList.add('display-media');
    }
}

export function createSocketConnectionInstance(settings={}) {
    return socketInstance = new Connection(settings);
}