import React from 'react';
import Axios from 'axios';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import { ChannelList } from './global-chat/channel-list';
import './global-chat/style.scss';
import { MessagesPanel } from './global-chat/messageContainer';
import {useNavigate } from "react-router-dom"
import socketClient from "socket.io-client";
const SERVER = "https://ms-teams-backend.herokuapp.com";
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions  } from '@material-ui/core';
export class Chat extends React.Component {

    state = {
        channels: null,
        socket: null,
        channel: null,
        username: null,
        open: false
    }
    socket;
    componentDidMount() {
        this.loadChannels();
        this.configureSocket();
        this.username=this.props.username;
    }
    handleMeeting = () => {
        this.state.open=(!this.state.open);
        console.log(this.state.open);
    }
    configureSocket = () => {
        var socket = socketClient(SERVER);
        socket.on('connection', () => {
            if (this.state.channel) {
                this.handleChannelSelect(this.state.channel._id);
            }
        });
        socket.on('channel', channel => {
            
            let allChannels = this.state.channels;
            allChannels.forEach(c => {
                if (c._id === channel.id) {
                    c.participants = channel.participants;
                }
            });
            this.setState({ channels: allChannels });
        });
        socket.on('message', message => {
            
            let allChannels = this.state.channels
            // console.log(allChannels)
            let notifyChannel;
            allChannels?.forEach(c => {
                if (c._id === message.channel_id) {
                    // console.log(this.state.channel);
                    if(message.senderName!=this.username && (!this.state.channel || this.state.channel._id!=message.channel_id) ){
                        notifyChannel=c;
                    }
                    if (!c.messages) {
                        c.messages = [message];
                    } else {
                        c.messages.push(message);
                    }
                }
            });
            // console.log("check")
            this.setState({ channels: allChannels });
            if(notifyChannel!=null){
                this.showToast(notifyChannel);
            }
        });
        this.socket = socket;
    }

    loadChannels = async () => {
        fetch('https://ms-teams-backend.herokuapp.com/getUserChannels/'+this.props.username).then(async response => {
            console.log("channels fetched!");
            this.setState({ channels: await response.json() });
        })
        
    }

    handleChannelSelect = id => {
        let channel = this.state.channels.find(c => {
            return c._id === id;
        });
        this.setState({ channel });
        this.socket.emit('channel-join', id, ack => {
        });
    }

    handleSendMessage = (channel_id, text) => {
        console.log(this.username);
        this.socket.emit('send-message', { channel_id, text, senderName: this.username, id: Date.now() });
    }
    handleRedirectToMeeting = (room_id) => {
        // console.log(room_id);
        this.socket.disconnect();
        this.props.joinMeeting(room_id);        
    }
    toggleCopied = () => {
        this.props.onCopied();
    }
    showToast = (c) => {
        this.props.showToast(c);
    }
    showUsers = (channelData) => {
        Axios.post('https://ms-teams-backend.herokuapp.com/leaveChannel', {
            username: this.username,
            link: channelData.link
        })
        .then(function (response) {
            window.location.reload();
        })
        .catch(function (error) {
            console.log(error);
        });

    }
    render() {
        return (
            <div className='chat-app'>
                {/*  */}
                {/* <Fab color="primary" onClick={this.handleMeeting} aria-label="add" style={{width:'50px',height:'43px'}}>
                    <AddIcon />
                </Fab> */}
                <ChannelList channels={this.state.channels} onSelectChannel={this.handleChannelSelect} />
                <MessagesPanel showUsers={this.showUsers} myUserName={this.username} promptCopied={this.toggleCopied} onRedirect={this.handleRedirectToMeeting} onSendMessage={this.handleSendMessage} channel={this.state.channel} />
            </div>
        );
    }
}