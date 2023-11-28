import './App.css';
import Login from './Components/login'; // Assuming the file and component names are capitalized
import Signup from './Components/signup';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Selection from './Components/selection';
import Adminlogin from './Components/adminlogin';
import Home from './Components/home';
import { Usercontextprovider } from './Components/usercontext';
import Post from './Components/createpost.js';
import Updatepost from './Components/updatepost.js'
import Profile from './Components/profile.js';
import Update from './Components/updateprofile.js';
import Explore from './Components/explore.js';
import Notifications from './Components/notifications.js';
import Search from './Components/search.js';
import Byname from './Components/searchbyname.js';
import Bykey from './Components/searchbykeyword.js';
import AdminHome from './Components/adminhome.js';
import { Admincontextprovider } from './Components/admincontext.js';
import AdminProfile from './Components/adminprofile.js';
import AdminSearch from './Components/adminsearch.js';
import AdminByname from './Components/adminsearchbyname.js';
import AdminBykey from './Components/adminsearchbykey.js';

import { useState } from 'react';

const PrivateRoute = ({ isauthenticated }) => {

  return isauthenticated ?
    <>
      <Outlet />
    </>
    : <Navigate replace to='/selection' />

}

function App() {


  const [isauthenticated, isuserauthenticated] = useState(false);

  return (
    <>
      <Usercontextprovider>
        <Routes>
          <Route path='/selection' element={<Selection />} />
          <Route path='/userregister' element={<Signup />} />
          <Route path='/userlogin' element={<Login isuserauthenticated={isuserauthenticated} />} />
          <Route path='/' element={<PrivateRoute isauthenticated={isauthenticated} />}>
            <Route path='/userhome' element={<Home />} />
            <Route path='/post' element={<Post />} />
            <Route path='/postupdate/:Postid' element={<Updatepost />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/profileupdate' element={<Update />} />
            <Route path='/Explore' element={<Explore />} />
            <Route path='/Notifications' element={<Notifications />} />
            <Route path='/search' element={<Search />} />
            <Route path='/byname' element={<Byname />} />
            <Route path='/bykeyword' element={<Bykey />} />
            <Route />
          </Route>
        </Routes>
      </Usercontextprovider>

      <Admincontextprovider>
        <Routes>
          <Route path='/adminlogin' element={<Adminlogin isuserauthenticated={isuserauthenticated} />} />
          <Route path='/' element={<PrivateRoute isauthenticated={isauthenticated} />}>
            <Route path='/adminhome' element={<AdminHome />} />
            <Route path='/adminprofile' element={<AdminProfile />} />
            <Route path='/adminsearch' element={<AdminSearch />} />
            <Route path='/adminbyname' element={<AdminByname />} />
            <Route path='/adminbykeyword' element={<AdminBykey />} />
            <Route />
          </Route>
        </Routes>
      </Admincontextprovider>

    </>

  );
}

export default App;
