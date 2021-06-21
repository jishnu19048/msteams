import React from 'react';
import VideoFeed from './video-call/video-feed'
import Header from './video-call/header'
const VideoCallUI = () =>{
    return(
        <div className="video_ui">
            <Header/>
            <VideoFeed/>
        </div>
    )
}
export default VideoCallUI;