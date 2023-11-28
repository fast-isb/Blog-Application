import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './byname.css';

const AdminByname = () => {
    const [allUserPosts, setAllUserPosts] = useState([]);
    const [username, setusername] = useState('');


    async function showresult(e) {
        e.preventDefault();
        try {
            let response = await fetch('http://localhost:4000/adminsearch/username', {
                method: 'post',
                credentials: 'include',
                body: JSON.stringify({ username }),
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data.allUserPosts)) { // Check if data.allUserPosts is an array
                    setAllUserPosts(data.allUserPosts); // Set posts state with the received data
                } else {
                    console.error('Received data is not an array:', data.allUserPosts);
                }
            } else if (response.status === 403) {
                alert('Error');
            }
            else if (response.status === 404) {
                alert('User not found');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setusername('');
    }
    return (
        <>
            <nav className="navbar">
                <h1>Admin Search By Name</h1>
                <div className="options">
                    <div className="loggedin-options">
                        <Link to="/adminsearch" className="option-link">Back</Link>
                    </div>
                </div>
            </nav>
            <form onSubmit={(e) => showresult(e)}>
                <div className="search-container">
                    <input
                        type="text"
                        name='username'
                        placeholder="Enter name to search"
                        className="search-input"
                        value={username}
                        required={true}
                        onChange={(e) => setusername(e.target.value)}
                    />
                    <button className="search-button" >Search</button>
                </div>
            </form>

            <div className="posts-container-byname">
                {allUserPosts.map((post, index) => (
                    <div key={index} className="post-byname">
                        <h2>{post.title}</h2>
                        <p>Description: {post.description}</p>
                        <p>User ID: {post.userid}</p>

                        <h3>Comments:</h3>
                        {post.comments && post.comments.length > 0 ? (
                            <ul>
                                {post.comments.map((comment, commentIndex) => (
                                    <li key={commentIndex}>
                                        Commenter ID: {comment.commenters}, Text: {comment.text}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No comments</p>
                        )}

                        <h3>Likes:</h3>
                        <p>Total likes: {post.likes.totalLikes}</p>
                    </div>
                ))}
            </div>

        </>
    )

}
export default AdminByname;