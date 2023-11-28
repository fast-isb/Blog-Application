import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import './createpost.css'; // Import your CSS file for styling
import { Link } from 'react-router-dom';
const CreatePostPage = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [redirect, setredirect] = useState(false);
    const handleTitleChange = (event) => {
        setTitle(event.target.value);
    };

    const handleDescriptionChange = (event) => {
        setDescription(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        let response = await fetch("http://localhost:4000/post", {
            method: 'post',
            body: JSON.stringify({ title, description }),
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });
        if(response.status===201){
            alert("Posted");
            setredirect(true);
        }else if(response.status===400){
            alert("All fields required");
        }
        setTitle('');
        setDescription('');
    };
    if (redirect) {
        return <Navigate to={'/userhome'} />
    }
    return (
        <div className="post-container">
            <h1>Create a New Post</h1>
            <form className="post-form">
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
                <button type="submit" className="post-button" onClick={handleSubmit}>Publish</button>
                <Link to="/userhome" className="post-button1">Back</Link>
            </form>
        </div>
    );
};

export default CreatePostPage;
