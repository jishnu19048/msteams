import React from 'react';
import { ChannelList } from './global-chat/channel-list';
import './global-chat/style.scss';
import { MessagesPanel } from './global-chat/messageContainer';
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
                this.handleChannelSelect(this.state.channel.id);
            }
        });
        socket.on('channel', channel => {
            
            let channels = this.state.channels;
            channels.forEach(c => {
                if (c.id === channel.id) {
                    c.participants = channel.participants;
                }
            });
            this.setState({ channels });
        });
        socket.on('message', message => {
            
            let channels = this.state.channels
            channels.forEach(c => {
                if (c.id === message.channel_id) {
                    if (!c.messages) {
                        c.messages = [message];
                    } else {
                        c.messages.push(message);
                    }
                }
            });
            this.setState({ channels });
        });
        this.socket = socket;
    }

    loadChannels = async () => {
        fetch('http://localhost:8080/getChannels').then(async response => {
            let data = await response.json();
            this.setState({ channels: data.channels });
        })
    }

    handleChannelSelect = id => {
        let channel = this.state.channels.find(c => {
            return c.id === id;
        });
        this.setState({ channel });
        this.socket.emit('channel-join', id, ack => {
        });
    }

    handleSendMessage = (channel_id, text) => {
        console.log(this.username);
        this.socket.emit('send-message', { channel_id, text, senderName: this.username, id: Date.now() });
    }

    render() {

        return (
            <div className='chat-app'>
                <ChannelList channels={this.state.channels} onSelectChannel={this.handleChannelSelect} />
                <MessagesPanel myUserName={this.username} onSendMessage={this.handleSendMessage} channel={this.state.channel} />
            </div>
        );
    }
}