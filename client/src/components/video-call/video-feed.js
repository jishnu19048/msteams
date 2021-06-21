import React, { useEffect } from 'react';
import './_video-feed.css';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
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
    const [openx, setOpen] = React.useState(true);
    const navigate =useNavigate();
    const handleStartMeet = () => {
      setOpen(!openx);
    };
    useEffect(()=>{
      if(user) startCall();
    }, [user]);
    const startCall=() => {
      socketInstance.current=createSocketConnectionInstance();
      console.log("HEY");
    }
    const endCall=() => {
      socketInstance.current.endConnection();
      navigate('/');
    }
    const handleuser = (user) => {
      setUser(user);
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
                <div className="options__right" onClick={handleStartMeet}>
                    <Fab className={classes.options__button}>
                        <PersonAddIcon/>
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
          </div>
        </div>
      );
}
export default VideoFeed;