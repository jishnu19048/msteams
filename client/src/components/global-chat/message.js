import React from 'react';
import './style.scss';

export class Message extends React.Component {

    render() {
        if(this.props.myUserName==this.props.senderName){
            return (
                <li className='message-item'>
                    <div><b>{this.props.senderName}</b></div>
                    <span>{this.props.text}</span>
                </li>
            )
        }else{
            return (
                <li className='message-item-him'>
                    <div><b>{this.props.senderName}</b></div>
                    <span>{this.props.text}</span>
                </li>
            )
        }
    }
}