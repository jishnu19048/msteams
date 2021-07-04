import React from 'react';
import './style.scss';

export class Channel extends React.Component {

    click = () => {
        this.props.onClick(this.props.id);
    }

    render() {
        return (
            <div className='channel-item' onClick={this.click}>
                <div>{this.props.name}</div>
                <span>{this.props.participants} active</span>
            </div>
        )
    }
}