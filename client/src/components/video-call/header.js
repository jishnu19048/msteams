import React from 'react';
import './_header.css';
const Header = () =>{
    let params = new URL(window.location.href);
    const meetingName = params.searchParams.get("name");
    return(
        <div className="header">
            <div className="logo">
              <div className="header__back">
                <i className="fas fa-angle-left" />
              </div>
              <h3>{meetingName}</h3>
            </div>
          </div>
    )
}
export default Header;