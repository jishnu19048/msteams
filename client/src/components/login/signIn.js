import React, {useState, useEffect} from 'react';
import { useNavigate } from "react-router-dom";
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import { SiMicrosoftteams } from 'react-icons/si';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { auth } from "../../firebase";
import firebase from "firebase/app";
import "firebase/auth";
import {useAuth} from "../../middleware/UserProvider";
import CircularProgress from '@material-ui/core/CircularProgress';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import backGround from './ms-teams.png';
function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}
function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {' © '}
      <Link color="inherit" href="http://www.jishnu.ninja/">
        Jishnu Raj Parashar
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
  },
  image: {
    backgroundImage: `url(${backGround})`,
    backgroundRepeat: 'no-repeat',
    backgroundColor:
      theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  paper: {
    marginTop: theme.spacing(8,4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '80%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  loadingDiv: {
    position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)"
  },
}));

export default function SignIn() {
  const {currentUser} = useAuth();
  const [loading,setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const classes = useStyles();
  const vertical='top';
  const horizontal='center';
  const navigate =useNavigate();
  const [openAlert, setOpenAlert] = React.useState(false);
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenAlert(false);
  };
  useEffect(() => {
    auth
    .getRedirectResult()
    .then(result => {
        if (!auth.currentUser) {
          console.log("signed out!");
          setLoading(false);
            return;
        }

        console.log("signed in!");
        let redirectPath='/';
        if(localStorage.getItem('path')!=null){
          redirectPath=localStorage.getItem('path');
        }
        setLoading(false);
        navigate(redirectPath);
        
    })
    .catch(error => {
        console.log(error, 'error');
    });
  }, []);
  const handleSignIn = () => {
    setLoading(true);
    auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
    .then(() => {
      auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        setLoading(false);
        navigate('/');
      })
      .catch((error) => {
        setLoading(false);
        setOpenAlert(true);
        console.error("Error signing in with password and email", error);
      });
    })
    .catch((error) => {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
    });
  };
  if(!loading){
    return (
      <Grid container  color="red" component="main" maxWidth="xs" className={classes.root}>
        <CssBaseline />
        <Grid item xs={false} sm={4} md={7} className={classes.image} />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <div className={classes.paper}>
            <Avatar  className={classes.avatar}>
              <SiMicrosoftteams />
            </Avatar >
            <Typography style={{ fontWeight: 600 }} component="h1" variant="h4">
              Sign in
            </Typography>
            <form className={classes.form} noValidate>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                onChange={event => setEmail(event.target.value)}
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                onChange={event => setPassword(event.target.value)}
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
              />
              
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleSignIn}
                className={classes.submit}
              >
                Sign In
              </Button>
              <Grid container>
                
                <Grid item xs>
                  <Link href="/SignUp" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
              <Box mt={8}>
                <Copyright />
              </Box>
              <Snackbar anchorOrigin={{ vertical, horizontal }} open={openAlert} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="error">
                  You entered invalid credentials.
                </Alert>
              </Snackbar>
            </form>
          </div>
        </Grid>
      </Grid>
    );
    }else{
      return(
        <div className={classes.loadingDiv}>
          <CircularProgress size={100}  />
        </div>
      )
    }
}