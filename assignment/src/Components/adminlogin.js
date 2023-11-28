import '../Components/adminlogin.css';
import { Link } from 'react-router-dom';
import {  useContext,useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Admincontext } from './admincontext.js';



const Adminlogin = ({isuserauthenticated}) => {
    const [username, setusername] = useState('');
    const [email, setemail] = useState('');
    const [password, setpassword] = useState('');
    const [redirect, setredirect] = useState(false);
    const { setAdmininfo } = useContext(Admincontext);

    // const [admininfo, setAdmininfo] = useState({}); // Rename Setadmininfo to setAdmininfo
    const userlogin = async (ev) => {
        ev.preventDefault();

        let response = await fetch("http://localhost:4000/adminlogin", {
            method: 'post',
            body: JSON.stringify({ username, email, password }),
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });
        if (response.status === 200) {
            response.json().then(userinfo=>{
                console.log(userinfo);
                setAdmininfo(userinfo);
                setredirect(true);
                isuserauthenticated(true);
            alert("Login Successfull");
            });
        
        } else {
            alert("Login Failed");
        }
    }

    if (redirect) {
        return <Navigate to={'/adminhome'} />
    }
    return (
        <>
            <div className="container-admin">
                <div className="form-container-admin">
                    <form id="login-form">
                        <h2>Admin Login</h2>
                        <input type="text" name="username" id="username" placeholder="Username" onChange={(e) => setusername(e.target.value)} required />
                        <input type="text" name="email" id="email" placeholder="Email" onChange={(e) => setemail(e.target.value)} required />
                        <input type="password" name="password" id="password" placeholder="Password" onChange={(e) => setpassword(e.target.value)} required />
                        <button type="submit" onClick={userlogin}>Login</button>
                        <div className="account">
                            <p>
                                Move to start <Link to="/selection">Back</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );

}
export default Adminlogin;