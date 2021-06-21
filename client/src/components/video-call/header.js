import React from 'react';
import './_header.css';
const Header = () =>{
    return(
        <div className="header">
            <div className="logo">
              <div className="header__back">
                <i className="fas fa-angle-left" />
              </div>
              <h3>Jishnu's Meeting</h3>
            </div>
          </div>
    )
}
export default Header;