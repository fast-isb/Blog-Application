import { Link } from 'react-router-dom';
import { useState } from 'react';
import './bykey.css';

const AdminBykey = () => {
    const [keyword, setusername] = useState('');

    const [allUserPosts, setAllUserPosts] = useState([]);

    async function showresult(e) {
        e.preventDefault();
        try {
            let response = await fetch('http://localhost:4000/adminsearch/keyword', {
                method: 'post',
                credentials: 'include',
                body: JSON.stringify({ keyword }),
                headers: { 'Content-Type': 'application/json' },
            });
    
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) {
                    setAllUserPosts(data); // Update the state with the received array directly
                } else {
                    console.error('Received data is not in the expected format:', data);
                }
            } else if (response.status === 403) {
                alert('Error');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setusername('');
    }
    
    // console.log(allUserPosts);
    return (
        <>
            <nav className="navbar">
                <h1>Admin Search By Keyword</h1>
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
                        placeholder="Enter to search"
                        className="search-input"
                        value={keyword}
                        required={true}
                        onChange={(e) => setusername(e.target.value)}
                    />
                    <button className="search-button" >Search</button>
                </div>
            </form><br/>
            {allUserPosts.map(post => (
                <div key={post._id} className="post1">
                    <h3>Title: {post.title}</h3>
                    <p>Description: {post.description}</p>
                    <p>Owner ID: {post.ownerid}</p>
                    {post.comments.length > 0 ? (
                        <div className="comments1">
                            <h4>Comments:</h4>
                            {post.comments.map(comment => (
                                <div key={comment._id} className="comment1">
                                    <p>Comment by {comment.commenters}: {comment.text}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No comments</p>
                    )}
                </div>
            ))}
        </>
    )
}
export default AdminBykey;