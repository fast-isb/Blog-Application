import React, { useEffect, useState } from 'react';
import './profile.css';
import { Link } from 'react-router-dom';
const AdminProfile = () => {

  const [id, setid] = useState(null);
  const [username, setusername] = useState('');
  const [email, setemail] = useState('');

  useEffect(() => {
    getdetails();
  }, [])
  function getdetails() {
    fetch('http://localhost:4000/adminprofile', {
      credentials: 'include',
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }
        return response.json();
      })
      .then(info => {
        setid(info.password);
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
        <p>Username: {username}</p>
      </div>
      <div>
        <p>Password: {id}</p>
      </div>
      <div>
        <p>Email: {email}</p>
      </div>
      <Link to="/adminhome" className="btn-profile">Back</Link>
    </div>
  );
};

export default AdminProfile;
