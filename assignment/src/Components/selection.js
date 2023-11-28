import React from 'react';
import { Link } from 'react-router-dom';
import '../Components/selection.css';
function UserSelection() {
  return (
    <div id="body1">
      <div className="container-selection">
        <h1>Welcome to our website</h1>
        <div className="selection-buttons">
          <Link to="/userregister" className="button-link">
            <button className="user-btn-selection">User</button>
          </Link>
          <Link to="/adminlogin" className="button-link">
            <button className="admin-btn">Admin</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default UserSelection;
