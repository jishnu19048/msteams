import React from 'react';
import './_header.css';
import Avatar from '@material-ui/core/Avatar';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
const Header = () =>{
    const [userList, setUserList] = React.useState([]);
    let params = new URL(window.location.href);
    const meetingName = params.searchParams.get("name");
    return(
        <div className="header">
            <div className="logo">
              <AvatarGroup max={4}>
                <Avatar>J</Avatar>
              </AvatarGroup>
              <div className="header__back">
                <i className="fas fa-angle-left" />
              </div>
              <h3>{meetingName}</h3>
            </div>
          </div>
    )
}
export default Header;