import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './search.css';

const Search = () => {

    return (
        <>
            <nav className="navbar">
                <h1>Search</h1>
                <div className="options">
                    <div className="loggedin-options">
                        <Link to="/userhome" className="option-link">Back</Link>
                    </div>
                </div>
            </nav>
            <>
                <div className="option-container">
                    <Link to="/byname" className="option-link-search">Name</Link>
                    <Link to="/bykeyword" className="option-link-search">Keyword</Link>
                </div>
            </>


        </>
    )

}
export default Search;