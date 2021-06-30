import React, {useEffect} from 'react';
import VideoFeed from './video-call/video-feed'
import Header from './video-call/header'
import { useNavigate } from "react-router-dom";
import { useAuth } from "../middleware/UserProvider";
import { auth, generateUserDocument } from "../firebase";
const VideoCallUI = () =>{
    const {currentUser} = useAuth();
    useEffect(() => {
        localStorage.removeItem('path');
    }, []);
    return(
        <div className="video_ui">
            <Header/>
            <VideoFeed/>
        </div>
    )
}
export default VideoCallUI;