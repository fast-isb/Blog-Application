import React, { useEffect, useState } from 'react';
import './profile.css';
import { Link } from 'react-router-dom';
const Profile = () => {

  const [id, setid] = useState(null);
  const [username, setusername] = useState('');
  const [email, setemail] = useState('');

  useEffect(() => {
    getdetails();
  }, [])
  function getdetails() {
    fetch('http://localhost:4000/profile', {
      credentials: 'include',
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }
        return response.json();
      })
      .then(info => {
        setid(info.userid);
        setusername(info.username);
        setemail(info.email);
      })
      .catch(error => {
        console.error('Fetch operation failed:', error);
        setusername();
        setemail();
        setid();
      });
  }
  return (
    <div className="container-profile">
      <h1>Profile Page</h1>
      <div>
        <p>ID: {id}</p>
      </div>
      <div>
        <p>Username: {username}</p>
      </div>
      <div>
        <p>Email: {email}</p>
      </div>
      <Link to="/profileupdate" className="btn-profile">Update</Link><br />
      <Link to="/userhome" className="btn-profile">Back</Link>
    </div>
  );
};

export default Profile;
