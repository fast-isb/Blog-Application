import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

import './notification.css';
const Notifications = () => {
    const [posts, setposts] = useState({});
    const { comments, followers } = posts;

    useEffect(() => {
        fetchNotifications();
    }, []);

    function fetchNotifications() {
        // console.log("front");
        fetch('http://localhost:4000/viewnotifications', {
            credentials: 'include',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok.');
                }
                return response.json();
            })
            .then(postsData => {
                // console.log(postsData);
                setposts(postsData);
            })
            .catch(error => {
                console.error('Fetch operation failed:', error);
                setposts([]);
            });
    }
    return (
        <>
            <nav className="navbar">
                <h1>Notifications</h1>
                <div className="options">
                    <div className="loggedin-options">
                        <Link to="/userhome" className="option-link">Back</Link>
                    </div>
                </div>
            </nav>
            <>
                <div className="notification-container">
                    <div className="notification-item">
                        {comments && Array.isArray(comments) && comments.length > 0 ? (
                            comments.map((comment, index) => (
                                <p key={index}>{comment}</p>
                            ))
                        ) : (
                            <p>No comments yet</p>
                        )}
                    </div>
                    <div className="notification-item">
                        {followers && Array.isArray(followers) && followers.length > 0 ? (
                            followers.map((follower, index) => (
                                <p key={index}>{follower}</p>
                            ))
                        ) : (
                            <p>{followers}</p>
                        )}
                    </div>
                </div>

            </>


        </>
    )
}
export default Notifications;