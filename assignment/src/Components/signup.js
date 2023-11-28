import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../Components/signup.css'; // Assuming the correct path to your CSS file



const Signup = () => {

    const [username, setusername] = useState('');
    const [email, setemail] = useState('');
    const [password, setpassword] = useState('');

    const signupuser = async (ev) => {
        ev.preventDefault();
        
        let response=await fetch("http://localhost:4000/userregister", {
            method: 'post',
            body: JSON.stringify({ username,email,password }),
            headers: { 'Content-Type': 'application/json' },
        });
        if(response.status===201){
            alert("Registeration Successfull");
        }else{
            alert("Registeration Failed");
        }
    }
    return (
        <>
            <div className="container-signup">
                <div className="form-container-signup">
                    <form id="register-form">
                        <h2>Register</h2>
                        <input type="text" name="username" id="username" placeholder="Username" onChange={(e) => setusername(e.target.value)} required />
                        <input type="text" name="email" id="email" placeholder="Email" onChange={(e) => setemail(e.target.value)} required />
                        <input type="password" name="password" id="password" placeholder="Password" onChange={(e) => setpassword(e.target.value)} required />
                        <button type="submit" id="register" onClick={signupuser}>Register</button>
                        <div className="account">
                            <p>
                                Already have an account <Link to="/userlogin">Login</Link>
                            </p>
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



export default Signup;
