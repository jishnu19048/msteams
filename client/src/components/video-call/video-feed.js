import React, { useEffect, useState, useRef  } from 'react';
import './_video-feed.css';
import './chat-sidebar.scss';
import { Button, Drawer, Input } from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import ChatIcon from '@material-ui/icons/Chat';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import MicOffIcon from '@material-ui/icons/MicOff';
import MicIcon from '@material-ui/icons/Mic';
import CallEndIcon from '@material-ui/icons/CallEnd';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Fab from '@material-ui/core/Fab';
import { makeStyles } from '@material-ui/core/styles';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions  } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import { useNavigate } from "react-router-dom";
import { createSocketConnectionInstance } from './connection';
import { useAuth } from "../../middleware/UserProvider";
import { generateUserDocument } from "../../firebase";
import Avatar from '@material-ui/core/Avatar';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import ScreenShareIcon from '@material-ui/icons/ScreenShare';
import StopScreenShareIcon from '@material-ui/icons/StopScreenShare';

const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
    },
    options__button :{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50px',
        fontSize:'1.2rem',
        width: '50px',
        marginRight: '0.5rem',
        marginLeft: '0.5rem'
      },
      AlignDialogActions: {
        justifyContent: 'center',
        paddingBottom: 15,
        marginInline:'100px'
      }
  }));
const VideoFeed = () =>{
    let socketInstance = React.useRef(null);
    const [user, setUser] = React.useState("dummy");
    const {currentUser} = useAuth();
    const [displayName, setDisplayName]=useState("");
    const classes = useStyles();
    const [message, setMessage] = useState('');
    const [micStatus, setMicStatus] = useState(true);
    const [camStatus, setCamStatus] = useState(true);
    const chatRef = useRef(null);
    const [openx, setOpen] = React.useState(true);
    const [chatOpen, setChatOpen] = React.useState(true);
    const navigate =useNavigate();
    const [messageItems, setMessageItems] = React.useState([]);
    const [displayStream, setDisplayStream] = useState(false);
    const [streaming, setStreaming] = useState(false);
    const [chatToggle, setChatToggle] = useState(false);
    
    socketInstance.current?.socket.on('check-user-video-toggle', value => {
      console.log(value.userDatauserID +"video status"+ value.value);

      if(value.value){
        socketInstance.current?.switchVideoOff(value.userData);
      }else{
        socketInstance.current?.switchVideoOn(value.userData);
      }
    })
    socketInstance.current?.socket.on('new-chat', message => {
      console.log(message);
      listenChat(message);
    })

    useEffect(() => {
        return () => {
            socketInstance.current?.endConnection();
        }
    }, []);
    useEffect(()=>{
      if(user) startCall();
    }, [user]);

    const handleStartMeet = () => {
      setOpen(!openx);
    };

    const startCall=() => {
      generateUserDocument(currentUser).then(res=>{
        setDisplayName(res.Name);
        socketInstance.current=createSocketConnectionInstance({
          updateInstance: updateFromInstance,
          username: res.Name});
      });
    }
    const updateFromInstance = (key, value) => {
        if (key === 'streaming') setStreaming(value);
        if (key === 'message') setMessages([...value]);
        if (key === 'displayStream') setDisplayStream(value);
    }
    const sendChat=()=>{
      // console.log(Date.now());
      const newItem = {id: Date.now(),modifier:"me",text:message, user:'me'}
      setMessageItems(messageItems.concat(newItem));
      socketInstance.current.sendMessage({message,displayName});
      setMessage('');
      // console.log({message});
    }
    const listenChat=(getChat)=>{
      const newItem = {id: Date.now(),modifier:"him",text:getChat.message, user:getChat.displayName}
      setMessageItems(messageItems.concat(newItem));
    }
    const endCall=() => {
      socketInstance.current.endConnection();
      navigate('/');
    }
    const handleCam = () => {   
      const { toggleVideoTrack } = socketInstance.current;
      toggleVideoTrack( !camStatus, micStatus );
      setCamStatus(!camStatus);
      socketInstance.current?.socket.emit('user-video-toggle',camStatus);
    }
    const handleMyMic = () => {
      const { toggleAudio } = socketInstance.current;
      toggleAudio();
      setMicStatus(!micStatus);
    }
    const hideChat = () => {
      setChatOpen(!chatOpen);
    }
    const toggleScreenShare = () => {
        const { reInitializeStream, toggleVideoTrack } = socketInstance.current;
        displayStream && toggleVideoTrack({video: false, audio: true});
        reInitializeStream(false, true, !displayStream ? 'displayMedia' : 'userMedia').then(() => {
            setDisplayStream(!displayStream);
            setCamStatus(false);
        });
    }
    const chatHandle = (bool) => {
        setChatToggle(bool);
    }
    const link=window.location.href;
    return (
        <div> 
          <div className="header">
            <div className="logo">
              <AvatarGroup id="userList" max={1}>
              </AvatarGroup>
              <div className="header__back">
                <i className="fas fa-angle-left" />
              </div>
              {/* <h3>{meetingName}</h3> */}
            </div>
          </div> 
          <div className="main">  
            <div className="main__left">
              <div className="videos__group">
                <div id="video-grid">
                </div>
              </div>
              <div className="options">
                <div className="options__left">
                    <Fab className={classes.options__button} onClick={handleCam}>
                        {camStatus &&
                          <VideocamOffIcon />
                        }
                        {!camStatus && <VideocamIcon/>
                        }
                    </Fab>
                    <Fab className={classes.options__button} onClick={handleMyMic}>
                        {micStatus &&
                          <MicOffIcon />
                        }
                        {!micStatus && <MicIcon/>
                        }
                    </Fab>
                    <Fab className={classes.options__button} onClick={toggleScreenShare}>
                        {!displayStream &&
                          <ScreenShareIcon />
                        }
                        {displayStream && <StopScreenShareIcon/>
                        }
                    </Fab>
                    
                </div>
                <div className="options__mid" onClick={endCall}>
                    <Fab color="secondary" className={classes.options__button}>
                        <CallEndIcon/>
                    </Fab>
                </div>
                <div className="options__right">
                    <Fab className={classes.options__button} onClick={handleStartMeet}>
                        <PersonAddIcon/>
                    </Fab>
                    <Fab className={classes.options__button}  onClick={() => chatHandle(!chatToggle)}>
                        <ChatIcon/>
                    </Fab>
                </div>
                <Dialog  open={openx} onClose={handleStartMeet} aria-labelledby="form-dialog-title">
                  <DialogTitle id="form-dialog-title">Jishnu's Meeting</DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      Copy the following link and share it with your friend or co-worker and you
                      are good to go!
                    </DialogContentText>
                    <TextField
                    disabled
                    fullWidth={true}
                    value={link}
                    variant="outlined"
                    />
                  </DialogContent>
                  <DialogActions className={classes.AlignDialogActions}>
                      <Button
                          variant="contained"
                          color="primary"
                          className={classes.button}
                          fullWidth={true}
                          onClick={handleStartMeet}
                        >
                          Okay
                    </Button>
                  </DialogActions>
                </Dialog>

              </div>
            </div>
            {/* <div className="main__right">
                <div className="main__chat_window">
                  <div className="messages">
                    <ul ref={chatRef}>
                      {messageItems.map(messageItems => (
                        <li key={messageItems.id} className={messageItems.modifier}>
                          {messageItems.user+": "+messageItems.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="main__message_container">
                <input id="chat_message" value={message} onChange={event => setMessage(event.target.value)} type="text" autoComplete="off" placeholder="Type here..." />
                <Fab id="send" className={classes.options__button}>
                    <SendIcon onClick={sendChat}/>
                </Fab>
                </div>
            </div> */}
            <Drawer className="chat-drawer" anchor={'right'} open={chatToggle} onClose={() => chatHandle(false)}>
                <div className="chat-head-wrapper">
                    <div className="chat-drawer-back-icon" onClick={() => chatHandle(false)}>
                        <ChevronRightIcon/>
                    </div>
                    <div className="chat-header">
                        <ChatIcon></ChatIcon>
                    </div>
                </div>
                <div className="chat-drawer-list">
                    <div className="messages">
                      <ul ref={chatRef}>
                        {messageItems.map(messageItems => (
                          <li key={messageItems.id} className={messageItems.modifier}>
                            <div><i>{messageItems.user} , {new Date(new Date().getTime()).toLocaleTimeString()}</i></div>
                            <span>{messageItems.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                </div>
                {/* <List className="chat-drawer-list">
                    
                </List> */}
                <div className="chat-drawer-input-wrapper">
                    <Input 
                        className="chat-drawer-input" 
                        onChange={event => setMessage(event.target.value)} 
                        value={message}
                        placeholder="Type Here"
                    />
                    <Fab id="send" className={classes.options__button}>
                        <SendIcon onClick={sendChat}/>
                    </Fab>
                </div>
            </Drawer>
          </div>
        </div>
      );
}
export default VideoFeed;