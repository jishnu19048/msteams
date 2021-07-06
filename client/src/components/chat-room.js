import React from 'react';
import { ChannelList } from './global-chat/channel-list';
import './global-chat/style.scss';
import { MessagesPanel } from './global-chat/messageContainer';
import {useNavigate } from "react-router-dom"
import socketClient from "socket.io-client";
const SERVER = "http://127.0.0.1:8080";
export class Chat extends React.Component {

    state = {
        channels: null,
        socket: null,
        channel: null,
        username: null
    }
    socket;
    componentDidMount() {
        this.loadChannels();
        this.configureSocket();
        this.username=this.props.username;
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
            console.log(allChannels)
            allChannels?.forEach(c => {
                if (c._id === message.channel_id) {
                    if (!c.messages) {
                        c.messages = [message];
                    } else {
                        c.messages.push(message);
                    }
                }
            });
            console.log("check")
            this.setState({ channels: allChannels });
        });
        this.socket = socket;
    }

    loadChannels = async () => {
        fetch('http://localhost:8080/getUserChannels/'+this.props.username).then(async response => {
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

    render() {

        return (
            <div className='chat-app'>
                <ChannelList channels={this.state.channels} onSelectChannel={this.handleChannelSelect} />
                <MessagesPanel myUserName={this.username} promptCopied={this.toggleCopied} onRedirect={this.handleRedirectToMeeting} onSendMessage={this.handleSendMessage} channel={this.state.channel} />
            </div>
        );
    }
}