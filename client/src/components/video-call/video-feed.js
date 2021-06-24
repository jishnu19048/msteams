import React, { useEffect, useState, useRef  } from 'react';
import './_video-feed.css';
import './_chat.css';
import SendIcon from '@material-ui/icons/Send';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import ChatIcon from '@material-ui/icons/Chat';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import MicOffIcon from '@material-ui/icons/MicOff';
import MicIcon from '@material-ui/icons/Mic';
import CallEndIcon from '@material-ui/icons/CallEnd';
import Fab from '@material-ui/core/Fab';
import { makeStyles } from '@material-ui/core/styles';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions  } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { useNavigate } from "react-router-dom";
import { createSocketConnectionInstance } from './connection';
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
    const classes = useStyles();
    const [message, setMessage] = useState('')
    const chatRef = useRef(null);
    const [openx, setOpen] = React.useState(true);
    const [chatOpen, setChatOpen] = React.useState(true);
    const navigate =useNavigate();
    const [messageItems, setMessageItems] = React.useState([]);
    const handleStartMeet = () => {
      setOpen(!openx);
    };
    // useEffect(()=>{
    //   if(socketInstance.current!=null) listenChat();
    // });
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
    const startCall=() => {
      socketInstance.current=createSocketConnectionInstance();
    }
    const sendChat=()=>{
      // console.log(Date.now());
      const newItem = {id: Date.now(),modifier:"me",text:message}
      setMessageItems(messageItems.concat(newItem));
      socketInstance.current.sendMessage({message});
      setMessage('');
      // console.log({message});
    }
    const listenChat=(getChat)=>{
      const newItem = {id: Date.now(),modifier:"him",text:getChat.message}
      setMessageItems(messageItems.concat(newItem));
    }
    const endCall=() => {
      socketInstance.current.endConnection();
      navigate('/');
    }
    // const handleuser = (user) => {
    //   setUser(user);
    // }
    const hideChat = () => {
      setChatOpen(!chatOpen);
      // if(!chatOpen){
      //   chatFeed.current.display="none";
      // }else{
      //   chatFeed.current.display="block";
      // }
    }
    const link=window.location.href;
    return (
        <div>  
          <div className="main">  
            <div className="main__left">
              <div className="videos__group">
                <div id="video-grid">
                </div>
              </div>
              <div className="options">
                <div className="options__left">
                    <Fab className={classes.options__button}>
                        <VideocamOffIcon />
                    </Fab>
                    <Fab className={classes.options__button}>
                        <MicOffIcon />
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
                    <Fab className={classes.options__button} onClick={hideChat}>
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
            <div className="main__right">
                <div className="main__chat_window">
                  <div className="messages">
                    <ul ref={chatRef}>
                      {messageItems.map(messageItems => (
                        <li key={messageItems.id} className={messageItems.modifier}>
                          {messageItems.text}
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
            </div>
          </div>
        </div>
      );
}
export default VideoFeed;