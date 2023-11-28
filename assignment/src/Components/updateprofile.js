import '../Components/updateprofile.css';
import {  useState } from 'react';
import { Link } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

const ProfileUpdate = () => {

    const [username, setusername] = useState('');
    const [email, setemail] = useState('');
    const [password, setpassword] = useState('');
    const [redirect, setredirect] = useState(false);

    const Update = async (event) => {
        event.preventDefault();
        try {
            let response = await fetch(`http://localhost:4000/profile`, {
                method: 'put',
                body: JSON.stringify({ username, email,password }),
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            if (response.status === 200) {
                alert("Profile Updated");
                setredirect(true);
            } else if (response.status === 400) {
                alert("Try another email");
            }
            setemail('');
            setusername('');
            setpassword('');
        } catch (error) {
            console.error('Error updating post:', error);
        }
    };

    if (redirect) {
        return <Navigate to={'/userhome'} />;
    }
    return (
        <>
            <div className="container-updateprofile">
                <div className="form-container-updateprofile">
                    <form id="login-form-updateprofile" >
                        <h2>Update Profile</h2>
                        <input type="text" name="username" id="username" placeholder="Username" onChange={(e) => setusername(e.target.value)} required />
                        <input type="text" name="email" id="email" placeholder="Email" onChange={(e) => setemail(e.target.value)} required />
                        <input type="password" name="password" id="password" placeholder="Password" onChange={(e) => setpassword(e.target.value)} required /><br/><br/>
                        <Link  className="btn-updateprofile" onClick={Update}>Update</Link><br/><br/><br/>
                        <Link to="/userhome" className="btn-updateprofile">Back</Link>
                    </form>
                </div>
            </div>
        </>
    );

}
export default ProfileUpdate;