import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import './createpost.css'; // Import your CSS file for styling
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';

const UpdatePostPage = () => {
    const { Postid } = useParams();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [redirect, setRedirect] = useState(false);

    const handleTitleChange = (event) => {
        setTitle(event.target.value);
    };

    const handleDescriptionChange = (event) => {
        setDescription(event.target.value);
    };

    const handleUpdate = async (event) => {
        event.preventDefault();
        try {
            let response = await fetch(`http://localhost:4000/post/${Postid}`, {
                method: 'put',
                body: JSON.stringify({ title, description }),
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            if (response.status === 200) {
                alert("Post Updated");
                setRedirect(true);
            } else if (response.status === 400) {
                alert("All fields required");
            }
            
            setTitle('');
            setDescription('');
        } catch (error) {
            console.error('Error updating post:', error);
        }
    };

    if (redirect) {
        return <Navigate to={'/userhome'} />;
    }

    return (
        <div className="post-container">
            <h1>Update Post</h1>
            <form className="post-form" onSubmit={handleUpdate}>
                <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Enter post title"
                    className="post-input"
                    required
                />
                <textarea
                    value={description}
                    onChange={handleDescriptionChange}
                    placeholder="Enter post description"
                    className="post-textarea"
                    required
                />
                <button type="submit" className="post-button">Update</button>
                <Link to="/userhome" className="post-button1">Back</Link>
            </form>
        </div>
    );
};

export default UpdatePostPage;
