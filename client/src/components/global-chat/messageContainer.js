import React from 'react';
import { Message } from './message';
import IconButton from '@material-ui/core/IconButton';
import SendIcon from '@material-ui/icons/Send';
import VideocamIcon from '@material-ui/icons/Videocam';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import copy from "copy-to-clipboard"; 
import messageTemp from './message-cover.png';
import './style.scss';

export class MessagesPanel extends React.Component {
    state = { input_value: '' }
    componentDidMount() {
        const objDiv = document.getElementById('allMessages');
        objDiv.scrollTop = objDiv.scrollHeight;
    }

    componentDidUpdate() {
        const objDiv = document.getElementById('allMessages');
        objDiv.scrollTop = objDiv.scrollHeight;
    }

    send = () => {
        if (this.state.input_value && this.state.input_value != '') {
            this.props.onSendMessage(this.props.channel._id, this.state.input_value);
            this.setState({ input_value: '' });
        }
    }

    redirect = () => {
        this.props.onRedirect(this.props.channel.link);
    } 

    handleInput = e => {
        this.setState({ input_value: e.target.value });
    }
    copyToClipBoard = () => {
        copy('http://localhost:3000/?invite='+this.props.channel._id);
        this.props.promptCopied();
        console.log("hi");
    }
    showUsers = () => {
        this.props.showUsers({link: this.props.channel._id});
    }
    render() {

        let list = <div className="no-content-message">
            <h1><span>Hop into a channel, or start a new meeting.</span></h1>
            <img className="no-content-message-image" src={messageTemp}>
            </img>
        </div>;
        if (this.props.channel) {
            list = <div className="time-message">{new Date().toLocaleString()}</div>;
        }
        if (this.props.channel && this.props.channel.messages) {
            list = this.props.channel.messages.map(m => <Message key={m.id} id={m.id} senderName={m.senderName} text={m.text} myUserName={this.props.myUserName}/>);
        }
        return (
            <div className='messages-panel'>
                {this.props.channel &&
                    <div className="messages-header">
                        <IconButton onClick={this.redirect} aria-label="delete">
                            <VideocamIcon />
                        </IconButton>
                        {/* <IconButton  onClick={this.copyToClipBoard} aria-label="delete">
                            <PersonAddIcon />
                        </IconButton> */}
                        <h3 className="channel-name">{this.props.channel.name}</h3>
                        <IconButton  aria-controls="user-list" className="right" onClick={this.showUsers} aria-label="delete">
                            <ExitToAppIcon />
                        </IconButton>
                    </div>
                }
                <ul id="allMessages" className="messages-list" ref={el => { this.el = el; }} >{list}</ul>
                {this.props.channel &&
                    <div className="messages-input">
                        <input type="text" onChange={this.handleInput} value={this.state.input_value} />
                        <IconButton onClick={this.send} aria-label="delete">
                            <SendIcon />
                        </IconButton>
                    </div>
                }
            </div>);
    }

}