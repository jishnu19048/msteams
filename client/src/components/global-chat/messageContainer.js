import React from 'react';
import { Message } from './message';
import IconButton from '@material-ui/core/IconButton';
import SendIcon from '@material-ui/icons/Send';
import VideocamIcon from '@material-ui/icons/Videocam';
import './style.scss';

export class MessagesPanel extends React.Component {
    state = { input_value: '' }
    send = () => {
        if (this.state.input_value && this.state.input_value != '') {
            this.props.onSendMessage(this.props.channel.id, this.state.input_value);
            this.setState({ input_value: '' });
        }
    }

    handleInput = e => {
        this.setState({ input_value: e.target.value });
    }

    render() {

        let list = <div className="no-content-message">Select a channel to talk into or create your own and invite your friends.</div>;

        if (this.props.channel && this.props.channel.messages) {
            list = this.props.channel.messages.map(m => <Message key={m.id} id={m.id} senderName={m.senderName} text={m.text} myUserName={this.props.myUserName}/>);
        }
        return (
            <div className='messages-panel'>
                <div className="messages-header">
                    <IconButton onClick={this.send} aria-label="delete">
                        <VideocamIcon />
                    </IconButton>
                </div>
                <ul className="meesages-list">{list}</ul>
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