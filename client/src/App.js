import logo from './logo.svg';
import './App.css';
import { Routes, Route,Switch, BrowserRouter } from 'react-router-dom';
import Sidebar from './components/sidebar';
import Header from './components/video-call/header';
import VideoCallUI from './components/video-call-ui';
import VideoFeed from './components/video-call/video-feed';
import SignIn from './components/login/signIn';
import SignUp from './components/login/signUp';
import {UserProvider} from './middleware/UserProvider';
import PrivateRoute from "./PrivateRoute"
function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <div className="App">
          
          <Routes>
            <PrivateRoute path='/' component={Sidebar}/>
            <PrivateRoute path='/join/*' component={VideoCallUI}/>
            <Route  path='/signUp' element={<SignUp/>}/>
            <Route  path='/signIn' element={<SignIn/>}/>
          </Routes>
        </div>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
