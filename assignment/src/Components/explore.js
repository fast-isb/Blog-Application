import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

import './explore.css';
const Explore = () => {
    const [users, setUsers] = useState([]);
    const [currentuser, setcurrentuser] = useState();
    const [following, setfollowing] = useState({ following: [] });
    const [followers, setfollowers] = useState({followers:[]});
    const [redirect, setRedirect] = useState(false);

    useEffect(() => {

        getid1();
        fetchUsers();
        fetchUserfollowing();
        fetchUserfollowers();
    }, []);

    function getid1() {
        fetch('http://localhost:4000/getid', {
            credentials: 'include',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok.');
                }
                return response.json();
            })
            .then(info => {
                setcurrentuser(info);
            })
            .catch(error => {
                console.error('Error fetching user ID:', error);
            });
    }
    const fetchUsers = () => {
        fetch('http://localhost:4000/explore', {
            credentials: 'include',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok.');
                }
                return response.json();
            })
            .then(userData => {
                // Assuming userData contains the 'user' array
                const fetchedUsers = userData.user;
                setUsers(fetchedUsers); // Update the 'users' state
            })
            .catch(error => {
                console.error('Fetching users failed:', error);
            });
    };
    function fetchUserfollowing() {
        fetch('http://localhost:4000/following', {
            credentials: 'include',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok.');
                }
                return response.json();
            })
            .then(following => {
                setfollowing(following);
            })
            .catch(error => {
                console.error('Fetch operation failed:', error);
                setfollowing([]);
            });
    }
    function fetchUserfollowers() {
        fetch('http://localhost:4000/followers', {
            credentials: 'include',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok.');
                }
                return response.json();
            })
            .then(following => {
                setfollowers(following);
            })
            .catch(error => {
                console.error('Fetch operation failed:', error);
                setfollowers([]);
            });
    }

    async function handleFollow(event, userid) {
        event.preventDefault();
        try {
            let response = await fetch(`http://localhost:4000/follow/${userid}`, {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
    
            if (response.status === 200) {
                setfollowing(prevFollowing => ({
                    ...prevFollowing,
                    following: [...prevFollowing.following, userid],
                }));
                alert("Success Follow");
            } else if (response.status === 400) {
                alert("Error");
            }
        } catch (error) {
            console.error('Error while following:', error);
        }
    }
    async function handleUnFollow(event, userid) {
        event.preventDefault();
        try {
            let response = await fetch(`http://localhost:4000/follow/${userid}`, {
                method: 'delete',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
    
            if (response.status === 200) {
                setfollowing(prevFollowing => ({
                    ...prevFollowing,
                    following: prevFollowing.following.filter(id => id !== userid),
                }));
                alert("Success Unfollow");
            } else if (response.status === 400) {
                alert("Error");
            }
        } catch (error) {
            console.error('Error while unfollowing:', error);
        }
    }
    function renderFollowButton(user) {
        if (following.following.includes(user.userid)) {
            return <button onClick={(e) => handleUnFollow(e, user.userid)}>Unfollow</button>;
        } else {
            return <button onClick={(e) => handleFollow(e, user.userid)}>Follow</button>;
        }
    }
    return (
        <>
            <nav className="navbar">
                <h1>Home Page</h1>
                <div className="options">
                    <div className="loggedin-options">
                        <Link to="/userhome" className="option-link" >Back</Link>
                    </div>
                </div>
            </nav>
            {currentuser && (
                <ul className="user-list">
                    {users.map(user => (
                        <li key={user.userid} className="post-user">
                            <p className="post-username">Name: {user.name}</p>
                            <p className="post-useremail">Email: {user.email}</p>
                            {renderFollowButton(user)}
                        </li>
                    ))}
                </ul>
            )}

        </>
    )
}
export default Explore;