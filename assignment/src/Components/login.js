import '../Components/login.css';
import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { Usercontext } from './usercontext.js';

const Login = ({isuserauthenticated}) => {

    const [username, setusername] = useState('');
    const [email, setemail] = useState('');
    const [password, setpassword] = useState('');
    const [redirect, setredirect] = useState(false);
    const { Setuserinfo } = useContext(Usercontext);
    const userlogin = async (ev) => {
        ev.preventDefault();

        let response = await fetch("http://localhost:4000/userlogin", {
            method: 'post',
            body: JSON.stringify({ username, email, password }),
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });
        if (response.status === 200) {
            response.json().then(userinfo=>{
                Setuserinfo(userinfo);
                setredirect(true);
                isuserauthenticated(true);
            alert("Login Successfull");
            })
        } else if (response.status === 403) {
            alert("Block by Admin");
        } else {
            alert("Login Failed");
        }
    }

    if (redirect) {
        return <Navigate to={'/userhome'} />
    }
    return (
        <>
            <div className="container-login">
                <div className="form-container-login">
                    <form id="login-form">
                        <h2>Login</h2>
                        <input type="text" name="username" id="username" placeholder="Username" onChange={(e) => setusername(e.target.value)} required />
                        <input type="text" name="email" id="email" placeholder="Email" onChange={(e) => setemail(e.target.value)} required />
                        <input type="password" name="password" id="password" placeholder="Password" onChange={(e) => setpassword(e.target.value)} required />
                        <button type="submit" onClick={userlogin}>Login</button>
                        <div className="account">
                            <p>
                                Dosen't have an account <Link to="/userregister">Signup</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );

}
export default Login;