import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './search.css';

const AdminSearch = () => {

    return (
        <>
            <nav className="navbar">
                <h1>Admin Search</h1>
                <div className="options">
                    <div className="loggedin-options">
                        <Link to="/adminhome" className="option-link">Back</Link>
                    </div>
                </div>
            </nav>
            <>
                <div className="option-container">
                    <Link to="/adminbyname" className="option-link-search">Name</Link>
                    <Link to="/adminbykeyword" className="option-link-search">Keyword</Link>
                </div>
            </>


        </>
    )

}
export default AdminSearch;