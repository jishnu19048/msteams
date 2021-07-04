import React from 'react';
import './style.scss';

export class Message extends React.Component {

    render() {
        return (
            <div className='message-item'>
                <div><b>{this.props.senderName}</b></div>
                <span>{this.props.text}</span>
            </div>
        )
    }
}