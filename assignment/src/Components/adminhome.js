
import { Admincontext } from './admincontext.js';
import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './adminhome.css';


const AdminHome = () => {
    const { admininfo, setAdmininfo } = useContext(Admincontext);
    const [currentuser, setcurrentuser] = useState();
    const [userData, setUserData] = useState([]);
    useEffect(() => {
        getid();
        fetch('http://localhost:4000/adminhome', {
            credentials: 'include',
        }).then(response => {
            response.json().then(info => {
                setAdmininfo(info);
                fetchUserPosts();
            });
        });
    }, []);
    function getid() {
        fetch('http://localhost:4000/getidadmin', {
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
    function logout() {
        fetch('http://localhost:4000/adminlogout', {
            credentials: 'include',
            method: 'POST',
        });
        setUserData([]);
        setAdmininfo(null);
    }
    function fetchUserPosts() {
        fetch('http://localhost:4000/viewposts', {
            credentials: 'include',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok.');
                }
                return response.json();
            })
            .then(postsData => {
                setUserData(postsData);
            })
            .catch(error => {
                console.error('Fetch operation failed:', error);
            });
    }
    async function Block(e, userid) {
        e.preventDefault();
        try {
            let response = await fetch(`http://localhost:4000/block/${userid}`, {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            if (response.status === 200) {
                alert("Blocked Successfully");
                fetchUserPosts();
            } else if (response.status === 404) {
                alert("User Not found");
            }

        } catch (error) {
            console.error('Error blocking :', error);
        }
    }
    async function Unblock(e, userid) {
        e.preventDefault();
        try {
            let response = await fetch(`http://localhost:4000/unblock/${userid}`, {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            if (response.status === 200) {
                alert("Unblocked Successfully");
                fetchUserPosts();
            } else if (response.status === 404) {
                alert("User Not found");
            }

        } catch (error) {
            console.error('Error Unblocking :', error);
        }
    }
    async function disable(e, userid, postid) {
        e.preventDefault();
        try {
            let response = await fetch(`http://localhost:4000/disable/${userid}/${postid}`, {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            if (response.status === 200) {
                alert("Disabled Successfully");
                fetchUserPosts();
            } else if (response.status === 404) {
                alert("User Not found");
            }

        } catch (error) {
            console.error('Error disabling :', error);
        }

    }
    async function enable(e, userid, postid) {
        e.preventDefault();
        try {
            let response = await fetch(`http://localhost:4000/enable/${userid}/${postid}`, {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            if (response.status === 200) {
                alert("Enable Successfully");
                fetchUserPosts();
            } else if (response.status === 404) {
                alert("User Not found");
            }

        } catch (error) {
            console.error('Error disabling :', error);
        }

    }
    const username = admininfo?.username;

    return (
        <>
            <nav className="navbar">
                <h1>Admin Home Page</h1>
                <div className="options">
                    {username && (
                        <div className="loggedin-options">
                            <Link to="/adminprofile" className="option-link" >Profile</Link>
                            <Link to="/adminsearch" className="option-link" >Search</Link>
                            <Link className="option-link1" onClick={logout}>Logout</Link>
                        </div>
                    )}

                    {!username && (
                        <div className="loggedout-options">
                            <Link to="/adminlogin" className="option-link">Login</Link>

                        </div>
                    )}
                </div>
            </nav>
            <div className="userData">
                {userData.map(user => (
                    <div key={user._id} className="userCard">
                        <h2>{user.name}</h2>
                        <p>{user.userid}</p>
                        <p>Can Login: {user.canlogin ? 'Yes' : 'No'}</p>
                        {user.canlogin ? (
                            <button onClick={(e) => Block(e, user.userid)}>Block</button>
                        ) : (
                            <button onClick={(e) => Unblock(e, user.userid)}>Unblock</button>
                        )}
                        <div className="userPosts" >
                            {user.posts.map(post => (
                                <div key={post._id} className="postCard">
                                    <h3>Title: {post.title}</h3>
                                    <p>Description: {post.description}</p>
                                    <p>Owner ID: {post.ownerid}</p>
                                    <p>Post ID: {post.postid}</p>
                                    <p>Can Show: {post.canshow ? 'Yes' : 'No'}</p>
                                    {post.canshow ? (
                                        <button onClick={(e) => disable(e, user.userid,post.postid)}>Block</button>
                                    ) : (
                                        <button onClick={(e) => enable(e, user.userid,post.postid)}>Unblock</button>
                                    )}
                                    {post.comments.length > 0 ? (
                                        <ul className="commentList">
                                            {post.comments.map(comment => (
                                                <li key={comment._id} className="commentItem">
                                                    Comment by {comment.commenters}: {comment.text}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>No comments</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}
export default AdminHome;