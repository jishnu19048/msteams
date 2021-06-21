import logo from './logo.svg';
import './App.css';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Sidebar from './components/sidebar';
import Header from './components/video-call/header';
import VideoCallUI from './components/video-call-ui';
import VideoFeed from './components/video-call/video-feed';
function App() {
  return (
    <BrowserRouter basename="/">
      <div className="app">
        <Routes>
          <Route exact path='/' element={<Sidebar/>}/>
          <Route exact path='/join/*'element={<VideoCallUI/>}/>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
