import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Usercontext } from './usercontext.js';
import './home.css';
import { format } from 'date-fns';

const Home = () => {

    const { userinfo, Setuserinfo } = useContext(Usercontext);
    const [posts, setposts] = useState([]);
    const [currentuser, setcurrentuser] = useState();
    const [following, setfollowing] = useState([]);
    const [followers, setfollowers] = useState([]);
    const [comment, setcomment] = useState();
    useEffect(() => {
        getid();
        fetch('http://localhost:4000/userhome', {
            credentials: 'include',
        }).then(response => {
            response.json().then(info => {
                Setuserinfo(info);
                fetchUserPosts();
                fetchUserfollowing();
                fetchUserfollowers();
            });
        });
    }, []);
    function logout() {
        fetch('http://localhost:4000/logout', {
            credentials: 'include',
            method: 'POST',
        });
        Setuserinfo(null);
        setposts([]);
    }
    function fetchUserPosts() {
        fetch('http://localhost:4000/posts', {
            credentials: 'include',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok.');
                }
                return response.json();
            })
            .then(postsData => {
                setposts(postsData);
            })
            .catch(error => {
                console.error('Fetch operation failed:', error);
                setposts([]);
            });
    }
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
    function getid() {
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
    async function deletion(postId) {
        try {
            let response = await fetch(`http://localhost:4000/post/${postId}`, {
                method: 'delete',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            if (response.status === 200) {
                alert("Post Deleted");
                setposts(prevPosts => prevPosts.filter(post => !(post.userid === currentuser.userid && post.posts.postid === postId)));
            } else if (response.status === 404) {
                alert("Post Not found");
            }
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    }

    async function addcomment(event, postid, userid) {
        event.preventDefault();
        try {
            let response = await fetch(`http://localhost:4000/comment/${userid}/${postid}`, {
                method: 'post',
                body: JSON.stringify({ comment }),
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            if (response.status === 200) {
                alert("Comment posted");
                fetchUserPosts();
                setTimeout(() => {
                    setcomment('');
                }, 100); // Adjust the delay if necessary
            } else if (response.status === 404) {
                alert("Comment Not found");
            } else if (response.status === 403) {
                alert("Comment required");
            }

        } catch (error) {
            console.error('Error adding comment:', error);
        }
    }
    async function deletecomment(event, postid, userid, commentid) {
        event.preventDefault();
        // console.log("post "+postid);
        // console.log("user "+userid);
        // console.log("commentid "+commentid);
        try {
            let response = await fetch(`http://localhost:4000/comment/${userid}/${postid}/${commentid}`, {
                method: 'delete',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            if (response.status === 200) {
                alert("Comment deleted");
                fetchUserPosts();
                setTimeout(() => {
                    setcomment('');
                }, 100);
            } else if (response.status === 404) {
                alert("Comment Not found");
            } else if (response.status === 403) {
                alert("Error");
            }

        } catch (error) {
            console.error('Error adding comment:', error);
        }
    }
    async function addLike(event, userid, postid) {
        event.preventDefault();
        // console.log(userid,postid);
        try {
            let response = await fetch(`http://localhost:4000/like/${userid}/${postid}`, {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            if (response.status === 200) {
                alert("Post Liked");
                fetchUserPosts();
            } else if (response.status === 404) {
                alert("Post Not found");
            } else if (response.status === 403) {
                alert("Error");
            }

        } catch (error) {
            console.error('Error adding comment:', error);
        }
    }
    async function disLike(event, userid, postid) {
        try {
            let response = await fetch(`http://localhost:4000/like/${userid}/${postid}`, {
                method: 'delete',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            if (response.status === 200) {
                alert("Post disliked Successfully");
                fetchUserPosts();
            } else if (response.status === 404) {
                alert("Post Not found");
            } else if (response.status === 403) {
                alert("Error");
            }

        } catch (error) {
            console.error('Error disliking :', error);
        }
    }

    const username = userinfo?.username;
    return (
        <>
            <nav className="navbar">
                <h1>Home Page</h1>
                <div className="options">
                    {username && (
                        <div className="loggedin-options">
                            <Link to="/post" className="option-link">Create Post</Link>
                            <Link to="/profile" className="option-link" >Profile</Link>
                            <Link to="/Explore" className="option-link" >Explore</Link>
                            <Link to="/Notifications" className="option-link" >Notifications</Link>
                            <Link to="/search" className="option-link" >Search</Link>
                            <Link className="option-link1" onClick={logout}>Logout</Link>
                        </div>
                    )}

                    {!username && (
                        <div className="loggedout-options">
                            <Link to="/userlogin" className="option-link">Login</Link>
                            <Link to="/userregister" className="option-link">Register</Link>
                        </div>
                    )}
                </div>
            </nav>
            <div className="user-posts">
                {posts.length > 0 && (
                    <h2>Posts</h2>
                )}
                <ul>
                    {posts.map(user => (
                        <li key={`${user.userid}-${user.posts.postid}`} className="post-item">
                            <div className="post-content">
                                <h3 className="post-title">Title: {user.posts.title}</h3>
                                <p className="post-description">Description: {user.posts.description}</p>
                                <p className="post-description">
                                    Date: {format(new Date(user.posts.date), 'dd/MM/yyyy')}
                                </p>
                                <p className="post-description">Owner: {user.name}</p>
                                <p className="post-description">
                                    Total likes: {user.posts.likes ? user.posts.likes.totalLikes : 0}
                                </p>

                                {user.posts.likes && user.posts.likes.likerid && user.posts.likes.likerid.includes(currentuser.userid) ? (
                                    <button className="option-link4" onClick={(e) => disLike(e, user.userid, user.posts.postid)}>Unlike</button>
                                ) : (
                                    <button className="option-link3" onClick={(e) => addLike(e, user.userid, user.posts.postid)}>Like</button>
                                )}<br/><br/>

                                {currentuser.userid === user.userid && (
                                    <div className="post-options">
                                        <Link to={`/postupdate/${user.posts.postid}`} className="option-link">Update Post</Link>
                                        {user.posts.postid && (
                                            <Link onClick={() => deletion(user.posts.postid)} className="option-link">Delete Post</Link>
                                        )}
                                    </div>
                                )}
                                {/* Comment form */}
                                <form className="comment-form">
                                    <input
                                        name="content"
                                        type="text"
                                        placeholder="Add a comment..."
                                        id="comment-input"
                                        value={comment}
                                        onChange={(e) => setcomment(e.target.value)}
                                    />
                                    <button type="submit" id="comment-submit" onClick={(e) => addcomment(e, user.posts.postid, user.userid)}>Add Comment</button>
                                </form>
                                {user.posts.comments.length > 0 && (
                                    <h2>Comments</h2>
                                )}

                                <div className="comments-section">
                                    {user.posts.comments.map(comment => (
                                        <div key={comment.commentid} className="comment-item">
                                            <p>{comment.text}</p>
                                            {comment.commenters === currentuser.userid && (
                                                <button onClick={(e) => deletecomment(e, user.posts.postid, user.userid, comment.commentid)} className="option-link2" >Delete</button>
                                            )}
                                            {/* Add logic to show options for comment deletion/editing if needed */}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>

            </div>
        </>
    )
}
export default Home;