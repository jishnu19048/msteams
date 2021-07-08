import React, {useState, useEffect} from 'react';
import { useNavigate } from "react-router-dom";
import Axios from 'axios';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { auth, generateUserDocument } from "../../firebase";
import CircularProgress from '@material-ui/core/CircularProgress';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'© '}
      <Link color="inherit" href="https://material-ui.com/">
        Microsoft Engage
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  loadingDiv: {
    position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)"
  },
}));

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading,setLoading] = useState(true);
  const classes = useStyles();
  const navigate =useNavigate();
  const vertical='top';
  const horizontal='center';
  const [openAlert, setOpenAlert] = useState(false);
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenAlert(false);
  };
  useEffect(() => {
    setLoading(false);
  },[])
  const handleSignUp = async () => {
    setLoading(true);
    try{
      await auth.createUserWithEmailAndPassword(email, password).then(user =>{
        console.log("signed in!");
        generateUserDocument(user, {firstName});
        Axios.post('https://ms-teams-backend.herokuapp.com/createUser', {
          username: email
        })
        .then(function (response) {
          console.log(response);
          setLoading(false);
          navigate('/signIn');
        })
        .catch(function (error) {
          console.log(error);
        });
      });
    }
    catch(error){
      setLoading(false);
      console.log("Error signing up!",error);
      setOpenAlert(true);
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
    }
  };
  if(loading){
    return(
      <div className={classes.loadingDiv}>
        <CircularProgress size={100}  />
      </div>
    )
  }else{
    return (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography style={{ fontWeight: 600 }} component="h1" variant="h4">
            Sign up
          </Typography>
          <form className={classes.form} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="fname"
                  name="firstName"
                  variant="outlined"
                  required
                  fullWidth
                  id="firstName"
                  onChange={event => setFirstName(event.target.value)}
                  label="First Name"
                  autoFocus
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="lastName"
                  onChange={event => setLastName(event.target.value)}
                  label="Last Name"
                  name="lastName"
                  autoComplete="lname"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="email"
                  onChange={event => setEmail(event.target.value)}
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  onChange={event => setPassword(event.target.value)}
                  autoComplete="current-password"
                />
              </Grid>
              
            </Grid>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleSignUp}
              className={classes.submit}
            >
              Sign Up
            </Button>
            <Grid container justify="flex-end">
              <Grid item>
                <Link href="/signIn" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </form>
        </div>
        <Box mt={5}>
          <Copyright />
        </Box>
        <Snackbar anchorOrigin={{ vertical, horizontal }} open={openAlert} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity="error">
            There was a problem your details.
          </Alert>
        </Snackbar>
      </Container>
    ); 
  }
}