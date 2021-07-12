import React, {useState, useEffect} from 'react';
import Axios from 'axios';
import CircularProgress from '@material-ui/core/CircularProgress';
import { HiRefresh, HiStatusOnline } from 'react-icons/hi';
import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ChatIcon from '@material-ui/icons/Chat';
import MenuIcon from '@material-ui/icons/Menu';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles, useTheme, fade } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import InputBase from '@material-ui/core/InputBase';
import VideoCallIcon from '@material-ui/icons/VideoCall';
import SettingsIcon from '@material-ui/icons/Settings';
import Fab from '@material-ui/core/Fab';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions  } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import ChromeReaderModeIcon from '@material-ui/icons/ChromeReaderMode';
import Snackbar from '@material-ui/core/Snackbar';
import ChatForm from './chat-form';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../middleware/UserProvider";
import { auth, generateUserDocument } from "../firebase";
import Add from '@material-ui/icons/Add';
import { Row, Item } from '@mui-treasury/components/flex';
import { Info, InfoTitle, InfoSubtitle } from '@mui-treasury/components/info';
import { useTutorInfoStyles } from '@mui-treasury/styles/info/tutor';
import { useSizedIconButtonStyles } from '@mui-treasury/styles/iconButton/sized';
import { useDynamicAvatarStyles } from '@mui-treasury/styles/avatar/dynamic';
import MuiAlert from '@material-ui/lab/Alert';
import {Chat} from './chat-room';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const drawerWidth = 100;
function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}
const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    height: '90%'
  },
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    [theme.breakpoints.up('sm')]: {
      width: `calc(100%)`,
      marginLeft: 0,
    },
    background : '#7B83EB',
    zIndex: theme.zIndex.drawer + 1,
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    marginRight: 20,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: 'auto',
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '16ch',
      '&:focus': {
        width: '28ch',
      },
    },
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  options:{
    marginLeft: 10,
    marginRight: 10,
    background : '#7B83EB',
  },
  rows:{
    marginLeft: '15%',
    paddingBottom: 5,
    paddingTop: 5
  },
  AlignDialogActions: {
    justifyContent: 'center',
    paddingBottom: 15,
    marginInline:'100px'
  },
  loadingDiv: {
    position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)"
  },
  toolbarButtons: {
    marginLeft: 'auto',
  },
  action: {
    backgroundColor: '#a2cf6e',
    borderRadius:1000,
    height:20,
    width:20,
    boxShadow: '0 1px 4px 0 rgba(0,0,0,0.12)',
    padding: 2,
  },
}));

function ResponsiveDrawer(props) {
  const {currentUser} = useAuth();
  const {email} = currentUser;
  const [displayName, setDisplayName]=useState(null);
  const [loading,setLoading] = useState(true);
  const[open,setOpen] = useState(false);
  const[meetingName,setMeetingName] = useState("Your Meeting");
  const { window } = props;
  const classes = useStyles();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate =useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [prompt, setPrompt] = useState(false);
  const [channelUsers, setChannelUsers]= useState(null);
  const avatarStyles = useDynamicAvatarStyles({ radius: 12, size: 48 }); 
  const avatarStyles1 = useDynamicAvatarStyles({ radius: 50, size: 40 }); 
  const vertical='top';
  const horizontal='center';
  let channels=[];

  useEffect(() => {
    generateUserDocument(currentUser).then(res=>{
        setDisplayName(res.Name);
    });
    setLoading(false);
  })
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  const handleMeeting = () => {
    setOpen(!open);
  };
  const handleStartMeet = () => {
    setLoading(true);
        Axios.get(`https://ms-teams-backend.herokuapp.com/`).then(res => {
          setLoading(false);
          navigate(`/join/${res.data.link}`);
        })
  };
  const handleLogOut = () => {
    auth.signOut().then(() => {
      // Sign-out successful.
    }).catch((error) => {
      console.log(error);
    });
  }
  const handleJoinMeeting = (room_id) => {
    navigate(`/join/${room_id}`);
  }
  const showCopiedPrompt = () => {
    setPrompt(true);
  }
  const closePrompt = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setPrompt(false);
  };
  const leaveChannel = (data) => {
  };
  const hideUsers = () => {
    setChannelUsers(null);
  };
  const notify = (c) => toast.dark("New message in "+c.name+" channel.",{
    position: "bottom-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
  const drawer = (
    <div>
      <div className={classes.toolbar} />
      <Divider />
      <List>
      <ListItemIcon className={classes.rows}>
          <Fab onClick={handleMeeting} className={classes.options}  aria-label="add">
            <VideoCallIcon />
          </Fab>
      </ListItemIcon>
      <ListItemIcon className={classes.rows}>
          <ToastContainer 
            toastStyle={{ backgroundColor: "#5c6bc0" }}
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
      </ListItemIcon>
      </List>
      <Dialog  open={open} onClose={handleMeeting} aria-labelledby="form-dialog-title">
        <DialogTitle className={classes.AlignDialogActions} id="form-dialog-title">Meeting Name</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a name for your meeting:
          </DialogContentText>
          <TextField
          fullWidth={true}
          onChange={event => setMeetingName(event.target.value)}
          defaultValue="Your Meeting"
          variant="outlined"
          >Your Meeting</TextField>
        </DialogContent>
        <DialogActions className={classes.AlignDialogActions}>
            <Button
                variant="contained"
                color="primary"
                className={classes.button}
                fullWidth={true}
                onClick={handleStartMeet}
              >
                JOIN
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );

  const container = window !== undefined ? () => window().document.body : undefined;
  if(loading){
    return(
      <div className={classes.loadingDiv}>
        <CircularProgress size={100} />
      </div>
    )
  }else{
    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar >
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              className={classes.menuButton}
            >
              <MenuIcon />
            </IconButton>
            <div className={classes.search}>
              <div className={classes.searchIcon}>
                <SearchIcon />
              </div>
              <InputBase
                placeholder="Search…"
                classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput,
                }}
                inputProps={{ 'aria-label': 'search' }}
              />
            </div>
            <Avatar style={{cursor:'pointer'}} className={classes.toolbarButtons} src="/broken-image.jpg" aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}/>
            <Menu
              className={classes.toolbarButtons}
              id="simple-menu"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem >
                <Row p={1.5} gap={2} borderRadius={5}>
                  <Item>
                    <Avatar
                      classes={avatarStyles}
                    />
                  </Item>
                  <Info position={'middle'} useStyles={useTutorInfoStyles}>
                    <InfoTitle>{displayName}</InfoTitle>
                    <InfoSubtitle>{email}</InfoSubtitle>
                  </Info>
                  <Item ml={1}  position={'middle'}>
                    <HiStatusOnline className={classes.action} />
                  </Item>
                </Row>
              </MenuItem>
              <MenuItem onClick={handleLogOut}>
                <Row  paddingLeft={2.8} gap={2} borderRadius={5}>
                  Logout
                </Row>
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <nav className={classes.drawer} aria-label="mailbox folders">
          <Hidden smUp implementation="css">
            <Drawer
              container={container}
              variant="temporary"
              anchor={theme.direction === 'rtl' ? 'right' : 'left'}
              open={mobileOpen}
              onClose={handleDrawerToggle}
              classes={{
                paper: classes.drawerPaper,
              }}
              ModalProps={{
                keepMounted: true,
              }}
            >
              {drawer}
            </Drawer>
          </Hidden>
          <Hidden xsDown implementation="css">
            <Drawer
              classes={{
                paper: classes.drawerPaper,
              }}
              variant="permanent"
              open
            >
              {drawer}
            </Drawer>
          </Hidden>
        </nav>
        <main className={classes.content}>
          <div className={classes.toolbar} /> 
          <Chat username={email} showToast={notify} onCopied={showCopiedPrompt} leaveChannel={leaveChannel} joinMeeting={handleJoinMeeting}/> 
          <Menu
              className={classes.toolbarButtons}
              id="user-list"
              anchorEl={channelUsers}
              keepMounted
              open={Boolean(channelUsers)}
              onClose={hideUsers}
            >
              {channels.map(c => 
                <MenuItem >
                  <Row p={0.5} gap={0.5} borderRadius={5}>
                    <Item>
                      <Avatar
                        classes={avatarStyles1}
                      />
                    </Item>
                    <Info position={'middle'} useStyles={useTutorInfoStyles}>
                      <InfoSubtitle>{c._id}</InfoSubtitle>
                    </Info>
                  </Row>
                </MenuItem>
              )};
            </Menu>
        </main>
        <Snackbar  anchorOrigin={{ vertical, horizontal }} open={prompt} autoHideDuration={6000} onClose={closePrompt}>
          <Alert onClose={closePrompt} severity="info">
            Invite-link copied to clipboard.
          </Alert>
        </Snackbar>
      </div>
    );
  }
  
}

export default ResponsiveDrawer;