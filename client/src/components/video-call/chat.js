import React, { useEffect } from 'react';
import './_chat.css';
import SendIcon from '@material-ui/icons/Send';
import Fab from '@material-ui/core/Fab';
import { makeStyles } from '@material-ui/core/styles';
import { useNavigate } from "react-router-dom";
import { createSocketConnectionInstance } from './connection';
const useStyles = makeStyles((theme) => ({
    options__button :{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50px',
        fontSize:'1.2rem',
        width: '50px',
        marginRight: '0.5rem',
        marginLeft: '0.5rem'
    }
  }));
const VideoFeed = () =>{
    let socketInstance = React.useRef(null);
    const classes = useStyles();
    return (
        <div className="main__right">
            <div className="main__chat_window">
            <div className="messages">
            </div>
            </div>
            <div className="main__message_container">
            <input id="chat_message" type="text" autoComplete="off" placeholder="Type here..." />
            <Fab id="send" className={classes.options__button}>
                <SendIcon/>
            </Fab>
            </div>
        </div>
      );
}
export default VideoFeed;