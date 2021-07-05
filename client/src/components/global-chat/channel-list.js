import React from 'react';
import { Channel } from './channel';
import './style.scss';
import CircularProgress from '@material-ui/core/CircularProgress';

export class ChannelList extends React.Component {

    handleClick = id => {
        // console.log(id)
        this.props.onSelectChannel(id);
    }

    render() {

        let list = <div className='loadingDiv'>
        <CircularProgress size={40} />
      </div>;
        if (this.props.channels && this.props.channels.map) {
            // console.log(this.props.channels[0]);
            list = this.props.channels.map(c => <Channel key={c._id} id={c._id} name={c.name} participants={c.participants.length} onClick={this.handleClick} />);
        }
        return (
            <div className='channel-list'>
                {list}
            </div>);
    }

}